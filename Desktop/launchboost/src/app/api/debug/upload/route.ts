import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD DEBUG START ===')
    
    const user = await getCurrentUserServer()
    console.log('User authenticated:', !!user)
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check environment variables
    const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
    const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'launchboost-uploads'
    const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

    console.log('Environment check:', {
      hasAccountId: !!R2_ACCOUNT_ID,
      hasAccessKey: !!R2_ACCESS_KEY_ID,
      hasSecretKey: !!R2_SECRET_ACCESS_KEY,
      bucketName: R2_BUCKET_NAME,
      hasPublicUrl: !!R2_PUBLIC_URL
    })

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      console.log('ERROR: Missing Cloudflare R2 credentials')
      return NextResponse.json({ 
        error: 'Cloudflare R2 not configured. Missing environment variables.',
        details: {
          hasAccountId: !!R2_ACCOUNT_ID,
          hasAccessKey: !!R2_ACCESS_KEY_ID,
          hasSecretKey: !!R2_SECRET_ACCESS_KEY
        }
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    console.log('File received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create a simple test upload (just return a fake URL for now)
    console.log('=== UPLOAD DEBUG END ===')
    
    // This is a debug endpoint. In a real scenario, you'd integrate with a storage service.
    // For now, we'll just return a placeholder success.
    return NextResponse.json({
      success: true,
      url: '/placeholder-image.jpg', // Placeholder URL
      debug: 'This is a debug response - real upload not attempted yet',
      fileName: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload debug error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
