import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { dealId } = await req.json()

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
    }

    // Verify user authentication
    const user = await requireAuth()
    const supabase = createServerComponentClient()

    // Verify deal ownership
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .eq('founder_id', user.id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found or unauthorized' }, { status: 404 })
    }

    // Check if deal is already featured
    if (deal.pricing_tier === 'featured' || deal.pricing_tier === 'pro') {
      return NextResponse.json({ error: 'Deal is already featured' }, { status: 400 })
    }

    // Create Stripe payment session for $39 Featured Deal
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Featured Deal Promotion',
              description: `Promote "${deal.title}" with featured placement, enhanced visibility, and priority positioning for 7 days.`,
              images: deal.product_logo_url ? [deal.product_logo_url] : [],
            },
            unit_amount: 1999, // $19.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${dealId}?featured=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${dealId}?featured=cancelled`,
      metadata: {
        dealId,
        userId: user.id,
        tier: 'featured',
        type: 'deal_promotion',
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Featured deal payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
