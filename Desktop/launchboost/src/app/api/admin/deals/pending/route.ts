import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAdmin } from '@/lib/server/auth'

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication with proper profile checking
    const { user, profile } = await requireAdmin()
    
    console.log('Pending deals API called by:', user.email, 'Role:', profile.role)

    const supabase = createServerComponentClient()

    // Fetch pending deals with founder information
    const { data: deals, error } = await supabase
      .from('deals')
      .select(`
        *,
        founder:profiles!deals_founder_id_fkey(
          id,
          full_name,
          email,
          company_name
        )
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending deals:', error)
      return NextResponse.json({ error: 'Failed to fetch pending deals' }, { status: 500 })
    }

    // Transform data to include founder information in flat structure
    const transformedDeals = deals?.map(deal => ({
      ...deal,
      founder_name: deal.founder?.full_name,
      founder_email: deal.founder?.email,
      founder_company: deal.founder?.company_name,
      // Remove nested founder object to avoid serialization issues
      founder: undefined
    })) || []

    return NextResponse.json({ 
      deals: transformedDeals,
      count: transformedDeals.length 
    })

  } catch (error) {
    console.error('Admin pending deals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}