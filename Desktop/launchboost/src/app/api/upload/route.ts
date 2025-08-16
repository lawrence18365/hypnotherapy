import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/server/auth'

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'launchboost-uploads'
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

// POST - Upload image to Cloudflare R2
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if Cloudflare R2 is configured
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        error: 'Cloudflare R2 not configured. Please add environment variables.' 
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${folder}/${user.id}/${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudflare R2 using REST API
    const uploadUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`
    
    // Create authorization signature for Cloudflare R2
    const { createSignature } = await import('@/lib/cloudflare-signature')
    
    // Calculate content hash for header
    const crypto = require('crypto')
    const contentSha256 = crypto.createHash('sha256').update(buffer).digest('hex')
    
    // Create timestamp for AMZ date header and signature
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.substr(0, 8)

    const signature = await createSignature({
      method: 'PUT',
      url: uploadUrl,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      body: buffer,
      contentType: file.type,
      amzDate: amzDate,
      dateStamp: dateStamp,
    })

    // Upload to R2
    const headers = {
      'Authorization': signature,
      'Content-Type': file.type,
      'Content-Length': buffer.length.toString(),
      'x-amz-content-sha256': contentSha256,
      'x-amz-date': amzDate
    };

    console.log('Uploading to R2 with headers:', JSON.stringify(headers, null, 2));

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: headers,
      body: buffer
    })

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text();
      console.error('R2 upload failed with status:', uploadResponse.status);
      console.error('R2 upload failed with body:', errorBody);
    }

    if (!uploadResponse.ok) {
      console.error('R2 upload failed:', await uploadResponse.text())
      return NextResponse.json({ 
        error: 'Upload failed. Please try again.' 
      }, { status: 500 })
    }

    // Generate public URL
    // Note: The default R2 URL requires the bucket to have public access enabled
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL}/${fileName}`
      : `https://pub-${R2_ACCOUNT_ID}.r2.dev/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET - Get upload configuration/status
export async function GET() {
  try {
    const user = await getCurrentUserServer()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const isConfigured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY)

    return NextResponse.json({
      configured: isConfigured,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      bucket: R2_BUCKET_NAME
    })

  } catch (error) {
    console.error('Upload config error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}