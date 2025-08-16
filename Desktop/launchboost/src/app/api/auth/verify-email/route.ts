import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting for email verification requests
const verifyAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_VERIFY_ATTEMPTS = 5
const VERIFY_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MIN_INTERVAL_MS = 60 * 1000 // 1 minute between requests

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (remoteAddr) return remoteAddr.split(',')[0].trim()
  return 'unknown'
}

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = verifyAttempts.get(ip)
  
  if (!record) {
    verifyAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Reset if window has passed
  if (now - record.lastAttempt > VERIFY_WINDOW_MS) {
    verifyAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Check minimum interval
  if (now - record.lastAttempt < MIN_INTERVAL_MS) {
    return true
  }
  
  // Check if too many attempts
  if (record.count >= MAX_VERIFY_ATTEMPTS) {
    return true
  }
  
  // Increment attempt
  record.count++
  record.lastAttempt = now
  
  return false
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// POST: Resend verification email
export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req)
  
  try {
    // Rate limiting check
    if (isVerifyRateLimited(clientIP)) {
      console.warn(`Rate limited email verification from IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Too many verification requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Email verification resend error:', error.message, 'Email:', email, 'IP:', clientIP)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    console.log('Email verification resent:', { email, ip: clientIP, timestamp: new Date().toISOString() })

    return NextResponse.json({
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Email verification unexpected error:', error, 'IP:', clientIP)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Verify email token
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const type = url.searchParams.get('type')
  const clientIP = getClientIP(req)

  try {
    if (!token || !type) {
      console.warn(`Invalid verification request from IP: ${clientIP}`)
      return NextResponse.redirect(`${url.origin}/sign-in?error=invalid_verification`)
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    // Verify the token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    })

    if (error || !data.user) {
      console.error('Email verification failed:', error?.message, 'IP:', clientIP)
      return NextResponse.redirect(`${url.origin}/sign-in?error=verification_failed`)
    }

    // Update user profile to mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    if (updateError) {
      console.error('Profile update error after verification:', updateError.message)
    }

    console.log('Email verified successfully:', { 
      userId: data.user.id, 
      email: data.user.email,
      ip: clientIP,
      timestamp: new Date().toISOString() 
    })

    return NextResponse.redirect(`${url.origin}/?verified=true`)

  } catch (error) {
    console.error('Email verification unexpected error:', error, 'IP:', clientIP)
    return NextResponse.redirect(`${url.origin}/sign-in?error=server_error`)
  }
}
