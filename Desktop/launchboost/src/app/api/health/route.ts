import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Test database connection
    const { data, error } = await supabase
      .from('deals')
      .select('id')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'failed',
          error: error.message
        }
      }, { status: 503 })
    }
    
    // Check if environment variables are set
    const envChecks = {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      stripe_key: !!process.env.STRIPE_SECRET_KEY,
      stripe_webhook: !!process.env.STRIPE_WEBHOOK_SECRET
    }
    
    const allEnvHealthy = Object.values(envChecks).every(Boolean)
    
    return NextResponse.json({
      status: allEnvHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: 'healthy',
        environment: envChecks
      },
      uptime: process.uptime()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'failed',
        error: 'Unable to connect to database'
      }
    }, { status: 503 })
  }
}
