import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { tier, productName } = await req.json()

    if (!tier || !productName) {
      return NextResponse.json({ error: 'Listing tier and product name are required' }, { status: 400 })
    }

    // Verify user authentication
    const user = await requireAuth()

    // Validate tier and set pricing
    let unitAmount: number
    let tierName: string
    let description: string

    switch (tier) {
      case 'featured':
        unitAmount = 1999 // $19.99
        tierName = 'Featured Listing'
        description = 'Featured placement on homepage, enhanced visibility, and priority positioning for 15 days.'
        break
      case 'premium':
        unitAmount = 3999 // $39.99
        tierName = 'Premium Listing'
        description = 'Top placement, social promotion, personal review, and extended featuring for 30 days.'
        break
      default:
        return NextResponse.json({ error: 'Invalid listing tier' }, { status: 400 })
    }

    // Create Stripe payment session for listing fee (BEFORE deal submission)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierName} - IndieSaasDeals`,
              description: `${description} Product: "${productName}"`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/new?payment=success&session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/new?payment=cancelled`,
      metadata: {
        userId: user.id,
        tier: tier,
        type: 'listing_fee',
        productName: productName,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Listing fee payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}