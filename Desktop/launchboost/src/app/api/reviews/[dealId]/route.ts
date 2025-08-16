import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/server/db';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { dealId } = params;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 reviews per request
    const offset = (page - 1) * limit;

    // Validate dealId
    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Check if deal exists
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Get reviews with user information
    const { data: reviews, error: reviewsError } = await supabase
      .from('deal_reviews')
      .select(`
        id,
        rating,
        review_text,
        created_at,
        updated_at,
        is_verified_purchase,
        user_id,
        profiles!inner (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalReviews, error: countError } = await supabase
      .from('deal_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('deal_id', dealId);

    if (countError) {
      console.error('Error counting reviews:', countError);
      return NextResponse.json(
        { error: 'Failed to count reviews' },
        { status: 500 }
      );
    }

    // Calculate average rating
    const { data: ratingStats, error: ratingError } = await supabase
      .from('deal_reviews')
      .select('rating')
      .eq('deal_id', dealId);

    let averageRating = 0;
    if (!ratingError && ratingStats && ratingStats.length > 0) {
      const sum = ratingStats.reduce((acc, review) => acc + review.rating, 0);
      averageRating = sum / ratingStats.length;
    }

    // Transform reviews to match expected format
    const transformedReviews = reviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      review_text: review.review_text,
      created_at: review.created_at,
      updated_at: review.updated_at,
      is_verified_purchase: review.is_verified_purchase,
      user: {
        id: review.profiles.id,
        full_name: review.profiles.full_name,
        username: review.profiles.username,
        avatar_url: review.profiles.avatar_url,
      },
    })) || [];

    const hasMore = (offset + limit) < (totalReviews || 0);

    return NextResponse.json({
      reviews: transformedReviews,
      averageRating,
      totalReviews: totalReviews || 0,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil((totalReviews || 0) / limit),
    });

  } catch (error) {
    console.error('Unexpected error in deal reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}