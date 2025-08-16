import { createClient } from '@/lib/client/db'
import { User } from '@supabase/supabase-js'

// Get current user from client-side
export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    return user
  } catch (error) {
    return null
  }
}

// Get user profile with founder status (client-side)
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
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

// Check if user is an admin (client-side)
export async function checkIsAdmin(userId: string) {
  const profile = await getUserProfile(userId)
  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// Get user profile with role (helper function)
export async function getCurrentUserWithProfile() {
  const user = await getCurrentUser()
  if (!user) return { user: null, profile: null }
  
  const profile = await getUserProfile(user.id)
  return { user, profile }
}

// Check if user is a founder (client-side)
export async function checkIsFounder(userId: string) {
  const profile = await getUserProfile(userId)
  return profile?.is_founder || false
}

// Sign in with OAuth provider
export async function signInWithProvider(provider: 'google' | 'github') {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  
  if (error) {
    throw error
  }
  
  return data
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

// Create or update user profile
export async function upsertUserProfile(user: User, isFounder = false) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      is_founder: isFounder,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error upserting user profile:', error)
    throw error
  }
  
  return data
}
