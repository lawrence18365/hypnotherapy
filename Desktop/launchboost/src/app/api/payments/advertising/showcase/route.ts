import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { companyName, companyUrl, logoUrl, productScreenshot } = await req.json()

    if (!companyName || !companyUrl) {
      return NextResponse.json({ error: 'Company name and URL are required' }, { status: 400 })
    }

    // Verify user authentication
    const user = await requireAuth()

    // Create Stripe payment session for $18 Product Showcase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Product Showcase Advertising',
              description: `Showcase "${companyName}" with large product card and homepage preview for 14 days. High engagement placement with call-to-action button.`,
              images: logoUrl ? [logoUrl] : (productScreenshot ? [productScreenshot] : []),
            },
            unit_amount: 1800, // $18.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise?payment=success&type=showcase`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/advertise?payment=cancelled`,
      metadata: {
        userId: user.id,
        type: 'advertising_spot',
        spotType: 'showcase',
        companyName,
        companyUrl,
        logoUrl: logoUrl || '',
        productScreenshot: productScreenshot || '',
        duration: '14',
        spots: '2'
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Product showcase advertising payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
