import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Debug endpoint to see all deals in database
export async function GET(request: NextRequest) {
  try {
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
    
    // Get ALL deals without any filters for debugging
    const { data: allDeals, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching deals for debug:', error)
      return NextResponse.json({ error: 'Failed to fetch deals', details: error }, { status: 500 })
    }
    
    return NextResponse.json({ 
      total_deals: allDeals?.length || 0,
      deals: allDeals || [],
      debug_info: {
        timestamp: new Date().toISOString(),
        message: 'This endpoint shows ALL deals in database regardless of status'
      }
    })
    
  } catch (error) {
    console.error('Error in debug deals endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
