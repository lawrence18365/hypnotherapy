import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { companyName, companyUrl, logoUrl } = await req.json()

    if (!companyName || !companyUrl) {
      return NextResponse.json({ error: 'Company name and URL are required' }, { status: 400 })
    }

    // Verify user authentication
    const user = await requireAuth()

    // Create Stripe payment session for $7 Sidebar Spot
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sidebar Advertising Spot',
              description: `Advertise "${companyName}" in category sidebar sections for 7 days. Small sponsor cards in 5 category sections.`,
              images: logoUrl ? [logoUrl] : [],
            },
            unit_amount: 700, // $7.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise?payment=success&type=sidebar`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: 'advertising_spot',
        spotType: 'sidebar',
        companyName,
        companyUrl,
        logoUrl: logoUrl || '',
        duration: '7',
        spots: '5'
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Sidebar advertising payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
