import { createRouteHandlerClient } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/auth'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function sanitizeInput(input: string, maxLength: number = 255): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, maxLength)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// GET: Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createRouteHandlerClient(cookies())

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error.message, 'User:', user.id)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Remove sensitive data before returning
    const safeProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_founder: profile.is_founder,
      email_verified: profile.email_verified,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    return NextResponse.json(safeProfile)

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.error('Profile GET unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    
    const { full_name, avatar_url, is_founder, bio, website, company } = body

    // Validate and sanitize inputs
    const updates: any = {}

    if (full_name !== undefined) {
      if (typeof full_name !== 'string') {
        return NextResponse.json(
          { error: 'Full name must be a string' },
          { status: 400 }
        )
      }
      updates.full_name = sanitizeInput(full_name, 100)
    }

    if (avatar_url !== undefined) {
      if (avatar_url && typeof avatar_url === 'string') {
        if (!validateURL(avatar_url)) {
          return NextResponse.json(
            { error: 'Invalid avatar URL' },
            { status: 400 }
          )
        }
        updates.avatar_url = avatar_url.substring(0, 500)
      } else {
        updates.avatar_url = null
      }
    }

    if (is_founder !== undefined) {
      if (typeof is_founder !== 'boolean') {
        return NextResponse.json(
          { error: 'is_founder must be a boolean' },
          { status: 400 }
        )
      }
      updates.is_founder = is_founder
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return NextResponse.json(
          { error: 'Bio must be a string' },
          { status: 400 }
        )
      }
      updates.bio = sanitizeInput(bio, 500)
    }

    if (website !== undefined) {
      if (website && typeof website === 'string') {
        if (!validateURL(website)) {
          return NextResponse.json(
            { error: 'Invalid website URL' },
            { status: 400 }
          )
        }
        updates.website = website.substring(0, 255)
      } else {
        updates.website = null
      }
    }

    if (company !== undefined) {
      if (typeof company !== 'string') {
        return NextResponse.json(
          { error: 'Company must be a string' },
          { status: 400 }
        )
      }
      updates.company = sanitizeInput(company, 100)
    }

    // Add timestamp
    updates.updated_at = new Date().toISOString()

    const supabase = createRouteHandlerClient(cookies())

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error.message, 'User:', user.id)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    console.log('Profile updated:', { userId: user.id, updates: Object.keys(updates) })

    // Remove sensitive data before returning
    const safeProfile = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      full_name: updatedProfile.full_name,
      avatar_url: updatedProfile.avatar_url,
      is_founder: updatedProfile.is_founder,
      email_verified: updatedProfile.email_verified,
      bio: updatedProfile.bio,
      website: updatedProfile.website,
      company: updatedProfile.company,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at
    }

    return NextResponse.json(safeProfile)

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.error('Profile update unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createRouteHandlerClient(cookies())

    // First, check if user has any active deals or payments
    const { data: userDeals, error: dealsError } = await supabase
      .from('deals')
      .select('id, title, pricing_tier')
      .eq('founder_id', user.id)
      .in('status', ['active', 'featured'])

    if (dealsError) {
      console.error('Deal check error during account deletion:', dealsError.message)
      return NextResponse.json(
        { error: 'Failed to check account status' },
        { status: 500 }
      )
    }

    if (userDeals && userDeals.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete account with active deals. Please remove or expire your deals first.',
          activeDealCount: userDeals.length
        },
        { status: 409 }
      )
    }

    // Soft delete - mark as deleted instead of hard delete
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${user.id}@example.com`, // Anonymize email
        full_name: 'Deleted User',
        avatar_url: null,
        bio: null,
        website: null,
        company: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile soft delete error:', profileError.message, 'User:', user.id)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    console.log('Account soft deleted:', { userId: user.id, timestamp: new Date().toISOString() })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.error('Account deletion unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
