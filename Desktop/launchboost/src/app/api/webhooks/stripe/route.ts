import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { stripe, verifyWebhookSignature, handleSuccessfulPayment } from '@/lib/stripe'
import { createServerClient } from '@/lib/server/db'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')
    
    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('No signature found', { status: 400 })
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature)
    
    console.log('Received Stripe webhook:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          await handleCheckoutCompleted(session)
        }
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook handled successfully', { status: 200 })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const dealId = session.metadata?.deal_id
    const paymentType = session.metadata?.type
    
    if (!dealId || paymentType !== 'featured_deal') {
      console.error('Invalid metadata in session:', session.metadata)
      return
    }

    console.log(`Processing featured deal payment for deal: ${dealId}`)
    
    // Update deal to featured status in database
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('deals')
      .update({ 
        is_featured: true,
        featured_at: new Date().toISOString(),
        featured_payment_id: session.payment_intent as string
      })
      .eq('id', dealId)
      .select()
    
    if (error) {
      console.error('Failed to update deal:', error)
      throw error
    }
    
    console.log('Successfully updated deal to featured:', data)
    
    // Send confirmation email to founder
    try {
      const customerEmail = session.customer_email || session.customer_details?.email
      if (customerEmail) {
        await sendPaymentConfirmationEmail(
          customerEmail,
          session.amount_total || 0,
          `Featured Deal Promotion - Deal ID: ${dealId}`
        )
        console.log('Payment confirmation email sent successfully to:', customerEmail)
      }
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError)
      // Don't fail the whole webhook if email fails
    }
    
  } catch (error) {
    console.error('Error handling checkout completion:', error)
    throw error
  }
}
