import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    R2_ACCOUNT_ID: !!process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, 
    R2_SECRET_ACCESS_KEY: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'NOT SET',
    R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL || 'NOT SET'
  }

  return NextResponse.json({
    message: 'Cloudflare R2 Configuration Status',
    envVars,
    allConfigured: Object.values(envVars).every(v => v !== false && v !== 'NOT SET')
  })
}
