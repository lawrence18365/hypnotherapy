import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This endpoint fetches approved deals for the homepage
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Build query with review statistics
    let query = supabase
      .from('deals')
      .select(`
        *,
        product_logo_url,
        profiles:founder_id (
          full_name,
          avatar_url
        ),
        deal_reviews (
          rating
        )
      `)
      .eq('status', 'live') // Only show live deals
      .gte('expires_at', new Date().toISOString()) // Only non-expired deals (expires_at >= now)
      .order('created_at', { ascending: false })
    
    // Add filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (featured === 'true') {
      // Filter by premium pricing tier for "featured" deals
      query = query.in('pricing_tier', ['featured', 'premium'])
    } else if (featured === 'false') {
      // Only show free deals when explicitly requesting non-featured
      query = query.eq('pricing_tier', 'free')
    }
    // If featured is null/undefined, show ALL deals regardless of pricing tier
    
    // Add limit
    query = query.limit(limit)
    
    const { data: dealsData, error } = await query
    
    if (error) {
      console.error('Error fetching deals:', error)
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }
    
    // Calculate review statistics for each deal
    const deals = dealsData?.map(deal => {
      const reviews = deal.deal_reviews || []
      const reviewCount = reviews.length
      const avgRating = reviewCount > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
        : 0
      
      // Remove the deal_reviews array from the response and add calculated fields
      const { deal_reviews, ...dealWithoutReviews } = deal
      
      // Convert prices from cents to dollars for display
      const processedDeal = {
        ...dealWithoutReviews,
        logo_url: dealWithoutReviews.product_logo_url, // Alias for consistency
        original_price: dealWithoutReviews.original_price / 100,
        deal_price: dealWithoutReviews.deal_price / 100,
        avg_rating: Number(avgRating.toFixed(1)),
        review_count: reviewCount
      }
      
      return processedDeal
    }) || []
    
    return NextResponse.json({ deals })
    
  } catch (error) {
    console.error('Error in deals endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
