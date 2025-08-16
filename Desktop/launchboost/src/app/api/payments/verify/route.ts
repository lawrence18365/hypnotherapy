import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Verify user authentication
    const user = await requireAuth()

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify session belongs to the current user
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized session access' }, { status: 403 })
    }

    // Check if payment was successful
    if (session.payment_status === 'paid' && session.metadata?.type === 'listing_fee') {
      return NextResponse.json({
        success: true,
        tier: session.metadata.tier,
        productName: session.metadata.productName,
        sessionId: sessionId,
        paymentIntentId: session.payment_intent
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Payment not completed or invalid session'
    }, { status: 400 })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}