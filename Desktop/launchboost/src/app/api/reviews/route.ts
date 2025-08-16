import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/server/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dealId, rating, reviewText } = body;

    // Validate input
    if (!dealId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid deal ID or rating' },
        { status: 400 }
      );
    }

    if (!reviewText || reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review text must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (reviewText.length > 1000) {
      return NextResponse.json(
        { error: 'Review text must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Check if deal exists
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, status')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this deal
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from('deal_reviews')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', session.user.id)
      .single();

    if (reviewCheckError && reviewCheckError.code !== 'PGRST116') {
      console.error('Error checking existing review:', reviewCheckError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this deal' },
        { status: 400 }
      );
    }

    // Check if user has claimed a code for this deal (for verified purchase badge)
    const { data: claimedCode } = await supabase
      .from('deal_codes')
      .select('id')
      .eq('deal_id', dealId)
      .eq('user_id', session.user.id)
      .eq('is_claimed', true)
      .single();

    // Create the review
    const { data: newReview, error: insertError } = await supabase
      .from('deal_reviews')
      .insert([
        {
          deal_id: dealId,
          user_id: session.user.id,
          rating: parseInt(rating),
          review_text: reviewText.trim(),
          is_verified_purchase: !!claimedCode,
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: newReview,
    });

  } catch (error) {
    console.error('Unexpected error in reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use /api/reviews/[dealId] to fetch reviews.' },
    { status: 405 }
  );
}