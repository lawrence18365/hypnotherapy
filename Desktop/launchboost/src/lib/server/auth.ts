// src/lib/server/auth.ts
import { createServerComponentClient } from '@/lib/server/db'
import { redirect } from 'next/navigation'

// Get current user from server component
export async function getCurrentUserServer() {
  const supabase = createServerComponentClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    return user
  } catch (error) {
    return null
  }
}

// Get user profile with role (server-side)
export async function getUserProfileServer(userId: string) {
  const supabase = createServerComponentClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return profile
}

// Get current user WITH profile (server-side)
export async function getCurrentUserWithProfileServer() {
  const user = await getCurrentUserServer()
  if (!user) return { user: null, profile: null }
  
  const profile = await getUserProfileServer(user.id)
  return { user, profile }
}

// Check if user is admin (server-side)
export async function checkIsAdminServer(userId: string) {
  const profile = await getUserProfileServer(userId)
  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// Require admin access (server-side)
export async function requireAdmin() {
  const { user, profile } = await getCurrentUserWithProfileServer()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard?error=admin_access_required')
  }
  
  return { user, profile }
}

// Create user profile if it doesn't exist
export async function ensureUserProfile(user: any) {
  const supabase = createServerComponentClient()
  
  // First check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (existingProfile) {
    return existingProfile
  }
  
  // Create new profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      is_founder: false,
      is_verified: false,
      role: 'user'
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }
  
  return newProfile
}

// Check if user is a founder (server-side)
export async function checkIsFounderServer(userId: string) {
  const profile = await getUserProfileServer(userId)
  return profile?.is_founder || false
}

// Require authentication for protected routes (server-side)
export async function requireAuth() {
  const user = await getCurrentUserServer()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

// Require founder access for founder routes (server-side)
export async function requireFounder() {
  const user = await requireAuth()
  const isFounder = await checkIsFounderServer(user.id)
  
  if (!isFounder) {
    redirect('/')
  }
  
  return user
}

// Export aliases for backward compatibility
export { getCurrentUserServer as getCurrentUser }
export { getUserProfileServer as getUserProfile }
export { checkIsFounderServer as checkIsFounder }
