import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServerComponentClient } from '@/lib/server/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const sig = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerComponentClient()

    // Handle successful payments
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Handle listing fee payments (NEW WORKFLOW)
      if (session.metadata?.type === 'listing_fee') {
        const { userId, tier, productName } = session.metadata

        console.log(`Processing listing fee payment: ${tier} for user ${userId}`)

        // Create payment record for tracking
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'succeeded',
            payment_type: 'listing_fee',
            listing_tier: tier,
            product_name: productName,
            session_id: session.id,
            created_at: new Date().toISOString()
          })

        if (paymentError) {
          console.error('Failed to record listing fee payment:', paymentError)
        }

        // Create notification for founder
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'system_update',
            title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Listing Payment Confirmed!`,
            message: `Your ${tier} listing payment has been confirmed. You can now submit your deal.`,
            created_at: new Date().toISOString()
          })

        if (notificationError) {
          console.error('Failed to create payment notification:', notificationError)
        }

        console.log(`Successfully processed listing fee payment: ${tier} for user ${userId}`)
      }
      // Handle advertising spot payments (NEW WORKFLOW)
      else if (session.metadata?.type === 'advertising_spot') {
        const { userId, spotType, companyName, companyUrl, logoUrl, productScreenshot, duration, spots } = session.metadata

        console.log(`Processing advertising spot payment: ${spotType} for user ${userId}`)

        // Calculate end date based on duration
        let activeUntil = new Date()
        if (duration === 'one_issue') {
          // Newsletter sponsors get 7 days for next issue
          activeUntil.setDate(activeUntil.getDate() + 7)
        } else {
          // Other spots use duration directly
          activeUntil.setDate(activeUntil.getDate() + parseInt(duration))
        }

        // Create advertising record
        const { error: adError } = await supabase
          .from('advertising_spots')
          .insert({
            user_id: userId,
            spot_type: spotType,
            company_name: companyName,
            company_url: companyUrl,
            logo_url: logoUrl || null,
            product_screenshot: productScreenshot || null,
            duration_days: duration === 'one_issue' ? 7 : parseInt(duration),
            total_spots: parseInt(spots),
            active_until: activeUntil.toISOString(),
            status: 'active',
            stripe_session_id: session.id,
            created_at: new Date().toISOString()
          })

        if (adError) {
          console.error('Failed to create advertising spot:', adError)
        }

        // Create payment record for tracking
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'succeeded',
            payment_type: 'advertising_spot',
            advertising_type: spotType,
            company_name: companyName,
            session_id: session.id,
            created_at: new Date().toISOString()
          })

        if (paymentError) {
          console.error('Failed to record advertising payment:', paymentError)
        }

        // Create notification for advertiser
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'system_update',
            title: `${spotType.charAt(0).toUpperCase() + spotType.slice(1)} Advertising Spot Confirmed!`,
            message: `Your ${spotType} advertising spot for "${companyName}" is now active for ${duration === 'one_issue' ? 'the next newsletter issue' : duration + ' days'}.`,
            created_at: new Date().toISOString()
          })

        if (notificationError) {
          console.error('Failed to create advertising notification:', notificationError)
        }

        console.log(`Successfully processed ${spotType} advertising spot for user ${userId}`)
      }
      // Handle legacy deal promotion payments (EXISTING WORKFLOW)
      else if (session.metadata?.type === 'deal_promotion') {

        console.log(`Processing ${tier} promotion for deal ${dealId}`)

        // Calculate feature duration based on tier
        const featureDuration = tier === 'pro' ? 14 : 7 // Pro: 14 days, Featured: 7 days
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + featureDuration)

        // Update deal with new tier and featuring
        const { error: updateError } = await supabase
          .from('deals')
          .update({
            pricing_tier: tier,
            is_featured: true,
            featured_until: featuredUntil.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', dealId)
          .eq('founder_id', userId)

        if (updateError) {
          console.error('Failed to update deal:', updateError)
          return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'succeeded',
            created_at: new Date().toISOString()
          })

        if (paymentError) {
          console.error('Failed to record payment:', paymentError)
        }

        // Create notification for founder
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'system_update',
            title: `Deal Promoted to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`,
            message: `Your deal has been successfully promoted and will be featured for ${featureDuration} days.`,
            deal_id: dealId,
            created_at: new Date().toISOString()
          })

        if (notificationError) {
          console.error('Failed to create notification:', notificationError)
        }

        // If Pro tier, create strategy consultation request
        if (tier === 'pro') {
          const { error: consultationError } = await supabase
            .from('feedback_tickets')
            .insert({
              user_id: userId,
              title: `Pro Strategy Consultation - ${session.metadata.dealId}`,
              description: `Founder has purchased Pro promotion and is eligible for personal deal strategy review and launch optimization advice.`,
              ticket_type: 'feature_request',
              priority: 'high',
              status: 'open',
              admin_notes: `Pro tier purchase - provide strategy consultation for deal: ${dealId}`,
              created_at: new Date().toISOString()
            })

          if (consultationError) {
            console.error('Failed to create consultation request:', consultationError)
          }
        }

        console.log(`Successfully processed ${tier} promotion for deal ${dealId}`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
