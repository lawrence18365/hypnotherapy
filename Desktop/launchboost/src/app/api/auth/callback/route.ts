import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Rate limiting map to prevent auth abuse
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_AUTH_ATTEMPTS = 5
const AUTH_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const BLOCKED_DURATION_MS = 60 * 60 * 1000 // 1 hour

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (remoteAddr) {
    return remoteAddr.split(',')[0].trim()
  }
  return 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = authAttempts.get(ip)
  
  if (!record) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Reset if window has passed
  if (now - record.lastAttempt > AUTH_WINDOW_MS) {
    authAttempts.set(ip, { count: 1, lastAttempt: now })
    return false
  }
  
  // Check if blocked
  if (record.count >= MAX_AUTH_ATTEMPTS && now - record.lastAttempt < BLOCKED_DURATION_MS) {
    return true
  }
  
  // Increment attempt
  record.count++
  record.lastAttempt = now
  
  return record.count > MAX_AUTH_ATTEMPTS
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

function sanitizeUserData(userData: any) {
  return {
    full_name: userData.full_name?.replace(/<[^>]*>/g, '').substring(0, 100) || '',
    avatar_url: userData.avatar_url?.substring(0, 500) || '',
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const clientIP = getClientIP(request)
  
  try {
    // Rate limiting check
    if (isRateLimited(clientIP)) {
      console.warn(`Rate limited auth attempt from IP: ${clientIP}`)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=rate_limited`)
    }

    if (!code) {
      console.warn(`Missing auth code from IP: ${clientIP}`)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=invalid_request`)
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Exchange the code for a session with security options
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth exchange error:', error.message, 'IP:', clientIP)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_failed`)
    }
    
    if (!data.user || !data.session) {
      console.warn('No user or session after auth exchange, IP:', clientIP)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=session_failed`)
    }

    // Validate email
    const userEmail = data.user.email || data.user.user_metadata?.email || ''
    if (!validateEmail(userEmail)) {
      console.error('Invalid email format:', userEmail, 'IP:', clientIP)
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=invalid_email`)
    }

    // Email verification check (if using email confirmation)
    if (!data.user.email_confirmed_at && process.env.SUPABASE_EMAIL_CONFIRMATION === 'true') {
      console.warn('Unverified email attempt:', userEmail, 'IP:', clientIP)
      return NextResponse.redirect(`${requestUrl.origin}/verify-email?email=${encodeURIComponent(userEmail)}`)
    }

    // Sanitize user data to prevent XSS
    const sanitizedData = sanitizeUserData(data.user.user_metadata || {})
    
    // Create or update user profile with security measures
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: userEmail,
        full_name: sanitizedData.full_name,
        avatar_url: sanitizedData.avatar_url,
        is_founder: false,
        email_verified: !!data.user.email_confirmed_at,
        last_sign_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      
    if (profileError) {
      console.error('Profile creation error:', profileError.message, 'User:', data.user.id)
      // Don't fail auth for profile errors, but log them
    }

    // Log successful authentication for monitoring
    console.log('Successful auth:', {
      userId: data.user.id,
      email: userEmail,
      ip: clientIP,
      timestamp: new Date().toISOString()
    })

    // Clear rate limit on successful auth
    authAttempts.delete(clientIP)

    // Redirect to dashboard after successful authentication
    const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    
    // Set security headers for session
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
    
  } catch (error) {
    console.error('Auth callback unexpected error:', error, 'IP:', clientIP)
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=server_error`)
  }
}
