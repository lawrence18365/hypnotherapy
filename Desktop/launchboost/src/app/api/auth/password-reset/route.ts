import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting for password reset attempts
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_RESET_ATTEMPTS = 3
const RESET_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes between requests

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (remoteAddr) return remoteAddr.split(',')[0].trim()
  return 'unknown'
}

function isResetRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = resetAttempts.get(ip)
  
  if (!record) {
    resetAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Reset if window has passed
  if (now - record.lastAttempt > RESET_WINDOW_MS) {
    resetAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Check cooldown period
  if (now - record.lastAttempt < COOLDOWN_MS) {
    return true
  }
  
  // Check if too many attempts
  if (record.count >= MAX_RESET_ATTEMPTS) {
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

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req)
  
  try {
    // Rate limiting check
    if (isResetRateLimited(clientIP)) {
      console.warn(`Rate limited password reset from IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait before trying again.' },
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

    // Always return success to prevent email enumeration attacks
    // But only send reset email if account exists
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    // Log the attempt for monitoring (but don't expose errors)
    if (error) {
      console.error('Password reset error:', error.message, 'Email:', email, 'IP:', clientIP)
    } else {
      console.log('Password reset requested:', { email, ip: clientIP, timestamp: new Date().toISOString() })
    }

    // Always return success response to prevent enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Password reset unexpected error:', error, 'IP:', clientIP)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
