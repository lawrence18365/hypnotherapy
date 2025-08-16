import { NextRequest, NextResponse } from 'next/server'

// Rate limiting for error reporting
const errorReports = new Map<string, { count: number; lastReport: number }>()
const MAX_ERROR_REPORTS = 10
const ERROR_WINDOW_MS = 60 * 1000 // 1 minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (remoteAddr) return remoteAddr.split(',')[0].trim()
  return 'unknown'
}

function isErrorReportRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = errorReports.get(ip)
  
  if (!record) {
    errorReports.set(ip, { count: 1, lastReport: now })
    return false
  }
  
  // Reset if window has passed
  if (now - record.lastReport > ERROR_WINDOW_MS) {
    errorReports.set(ip, { count: 1, lastReport: now })
    return false
  }
  
  // Check if too many reports
  if (record.count >= MAX_ERROR_REPORTS) {
    return true
  }
  
  // Increment count
  record.count++
  record.lastReport = now
  
  return false
}

function sanitizeErrorData(data: any) {
  return {
    message: String(data.message || '').substring(0, 1000),
    stack: String(data.stack || '').substring(0, 5000),
    componentStack: String(data.componentStack || '').substring(0, 3000),
    errorId: String(data.errorId || '').substring(0, 50),
    userAgent: String(data.userAgent || '').substring(0, 500),
    url: String(data.url || '').substring(0, 500),
    timestamp: data.timestamp || new Date().toISOString(),
  }
}

function classifyError(message: string, stack: string): string {
  if (message.includes('ChunkLoadError') || stack.includes('Loading chunk')) {
    return 'chunk_load_error'
  }
  if (message.includes('Script error') || message.includes('ResizeObserver')) {
    return 'browser_extension'
  }
  if (message.includes('Network Error') || message.includes('Failed to fetch')) {
    return 'network_error'
  }
  if (stack.includes('React') || stack.includes('Component')) {
    return 'react_error'
  }
  if (message.includes('TypeError') || message.includes('ReferenceError')) {
    return 'javascript_error'
  }
  return 'unknown_error'
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  
  try {
    // Rate limiting check
    if (isErrorReportRateLimited(clientIP)) {
      console.warn(`Rate limited error report from IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Too many error reports' },
        { status: 429 }
      )
    }

    const errorData = await request.json()
    
    // Validate required fields
    if (!errorData.message || !errorData.errorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Sanitize and enhance error data
    const sanitizedData = sanitizeErrorData(errorData)
    const errorType = classifyError(sanitizedData.message, sanitizedData.stack)
    
    const enrichedErrorData = {
      ...sanitizedData,
      errorType,
      clientIP,
      severity: errorType === 'javascript_error' ? 'high' : 'medium',
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || 'unknown',
    }
    
    // Log error with structured data
    console.error('Client Error Tracked:', {
      timestamp: new Date().toISOString(),
      ...enrichedErrorData
    })

    // In production, send to monitoring services
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to external monitoring services
      // await Promise.allSettled([
      //   sendToSentry(enrichedErrorData),
      //   sendToLogRocket(enrichedErrorData),
      //   saveToDatabase(enrichedErrorData)
      // ])
    }

    // Immediate alerts for critical errors
    if (enrichedErrorData.severity === 'high' && process.env.NODE_ENV === 'production') {
      console.error('CRITICAL ERROR ALERT:', enrichedErrorData)
      // TODO: Send Slack/email notification for critical errors
    }

    return NextResponse.json({ 
      success: true,
      errorId: enrichedErrorData.errorId
    })
    
  } catch (error) {
    console.error('Error tracking endpoint failed:', error, 'IP:', clientIP)
    return NextResponse.json(
      { error: 'Failed to track error' },
      { status: 500 }
    )
  }
}

// GET endpoint for error statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await requireAuth()
    // if (!user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    
    const errorStats = {
      totalReports: errorReports.size,
      activeIPs: Array.from(errorReports.keys()).length,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorStats)
    
  } catch (error) {
    console.error('Error stats endpoint failed:', error)
    return NextResponse.json(
      { error: 'Failed to get error stats' },
      { status: 500 }
    )
  }
}