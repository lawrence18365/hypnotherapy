import { NextRequest, NextResponse } from 'next/server'
import { createAdSpotCheckout, AdSpotType, AD_SPOT_PRICES } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adType, email, companyName, websiteUrl } = body

    // Validate ad type
    if (!adType || !AD_SPOT_PRICES[adType as AdSpotType]) {
      return NextResponse.json(
        { error: 'Invalid advertising spot type' },
        { status: 400 }
      )
    }

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await createAdSpotCheckout(
      adType as AdSpotType,
      email,
      companyName,
      websiteUrl
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Error creating advertising checkout:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}