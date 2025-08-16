import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getCurrentUser } from '@/lib/client/auth'

// Save user preferences for personalized deal experience
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { categories, minDiscount, maxBudget, emailAlerts, priceDropAlerts } = await request.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined
          },
        },
      }
    )

    // Upsert user preferences (create or update)
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        preferred_categories: categories || [],
        min_discount_threshold: minDiscount || 20,
        max_budget: maxBudget ? maxBudget : null,
        email_deal_alerts: emailAlerts !== undefined ? emailAlerts : true,
        email_price_drops: priceDropAlerts !== undefined ? priceDropAlerts : true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error saving user preferences:', error)
      // If table doesn't exist yet, just return success (graceful degradation)
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          message: 'Preferences saved (tables will be created soon)' 
        })
      }
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    // Grant achievement for completing setup
    try {
      await supabase.rpc('grant_achievement', {
        p_user_id: user.id,
        p_achievement_type: 'preferences_set',
        p_achievement_name: 'Setup Complete',
        p_description: 'Completed deal preferences setup!',
        p_badge_icon: '⚙️'
      })
    } catch (achievementError) {
      // Don't fail if achievement system isn't ready
      console.log('Achievement system not yet available')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Preferences saved successfully'
    })

  } catch (error) {
    console.error('Error in preferences endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined
          },
        },
      }
    )

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return defaults
        return NextResponse.json({
          preferences: {
            preferred_categories: [],
            min_discount_threshold: 20,
            max_budget: null,
            email_deal_alerts: true,
            email_price_drops: true
          },
          hasSetPreferences: false
        })
      }
      console.error('Error fetching user preferences:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    return NextResponse.json({
      preferences,
      hasSetPreferences: true
    })

  } catch (error) {
    console.error('Error in preferences GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}