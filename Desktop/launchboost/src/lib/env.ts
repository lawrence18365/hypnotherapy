/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

export interface Environment {
  // Database
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  
  // Authentication
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  
  // Payments
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  
  // Cloudflare R2 Storage
  CLOUDFLARE_R2_ACCOUNT_ID: string
  CLOUDFLARE_R2_ACCESS_KEY_ID: string
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: string
  CLOUDFLARE_R2_BUCKET_NAME?: string
  CLOUDFLARE_R2_PUBLIC_URL?: string
  
  // Application
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  NODE_ENV: string
}

const requiredEnvVars: (keyof Environment)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDFLARE_R2_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NODE_ENV'
]

export function validateEnvironment(): Environment {
  const missingVars: string[] = []
  const env = {} as Environment

  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    if (!value) {
      missingVars.push(varName)
    } else {
      (env as any)[varName] = value
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.map(v => `  - ${v}`).join('\n')}\n\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  // Additional validation
  if (!env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
  }

  if (!env.NEXTAUTH_URL.startsWith('http')) {
    throw new Error('NEXTAUTH_URL must be a valid HTTP/HTTPS URL')
  }

  if (env.NODE_ENV === 'production' && env.NEXTAUTH_URL.includes('localhost')) {
    throw new Error('NEXTAUTH_URL cannot contain localhost in production')
  }

  return env
}

// Validate environment on module import (server-side only)
let validatedEnv: Environment | null = null

export function getValidatedEnv(): Environment {
  if (!validatedEnv) {
    validatedEnv = validateEnvironment()
  }
  return validatedEnv
}

// Export for use in API routes and server components
export const env = typeof window === 'undefined' ? getValidatedEnv() : ({} as Environment)