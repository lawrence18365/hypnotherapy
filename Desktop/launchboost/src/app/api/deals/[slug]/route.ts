import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const supabase = createServerComponentClient()

    // Try to fetch deal by slug first, then by ID
    let deal = null
    let error = null

    // First attempt: fetch by slug
    const { data: dealBySlug, error: slugError } = await supabase
      .from('deals')
      .select(`
        *,
        founder:profiles!deals_founder_id_fkey(
          id,
          full_name,
          email,
          company_name,
          bio,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .eq('status', 'live')
      .single()

    if (dealBySlug && !slugError) {
      deal = dealBySlug
    } else {
      // Second attempt: fetch by ID (for backward compatibility)
      const { data: dealById, error: idError } = await supabase
        .from('deals')
        .select(`
          *,
          founder:profiles!deals_founder_id_fkey(
            id,
            full_name,
            email,
            company_name,
            bio,
            avatar_url
          )
        `)
        .eq('id', slug)
        .eq('status', 'live')
        .single()

      if (dealById && !idError) {
        deal = dealById
      } else {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
    }

    // Convert prices from cents to dollars for display
    const processedDeal = {
      ...deal,
      original_price: deal.original_price / 100,
      deal_price: deal.deal_price / 100,
    }

    // Increment view count
    try {
      await supabase
        .from('deals')
        .update({ 
          views_count: (deal.views_count || 0) + 1 
        })
        .eq('id', deal.id)
    } catch (viewError) {
      console.error('Failed to update view count:', viewError)
      // Don't fail the request if view count update fails
    }

    return NextResponse.json({ 
      deal: processedDeal,
      success: true 
    })

  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}