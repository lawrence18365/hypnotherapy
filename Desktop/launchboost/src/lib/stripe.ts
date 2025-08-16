import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Deal Pricing
export const FEATURED_DEAL_PRICE = 9900 // $99.00 in cents

// Advertising Spot Pricing (in cents)
export const AD_SPOT_PRICES = {
  sidebar: 700,     // $7.00
  featured: 1200,   // $12.00
  banner: 1500,     // $15.00
  newsletter: 2000, // $20.00
} as const

export type AdSpotType = keyof typeof AD_SPOT_PRICES

// Create checkout session for advertising spots
export async function createAdSpotCheckout(
  adType: AdSpotType,
  customerEmail: string,
  companyName?: string,
  websiteUrl?: string
) {
  const adSpotConfigs = {
    sidebar: {
      name: 'Sidebar Advertising Spot',
      description: 'Small sponsor card in category sections (7 days)',
    },
    featured: {
      name: 'Featured Card Advertising',
      description: 'Large featured card in top deals section (14 days)',
    },
    banner: {
      name: 'Banner Placement',
      description: 'Medium banner between homepage sections (7 days)',
    },
    newsletter: {
      name: 'Newsletter Sponsorship',
      description: 'Premium placement in weekly newsletter (one issue)',
    },
  }

  const config = adSpotConfigs[adType]
  const price = AD_SPOT_PRICES[adType]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: config.name,
            description: config.description,
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/advertise/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/advertise?canceled=true`,
    customer_email: customerEmail,
    metadata: {
      ad_type: adType,
      company_name: companyName || '',
      website_url: websiteUrl || '',
      type: 'advertising_spot',
    },
  })

  return session
}

// Create checkout session for featured deal payment
export async function createFeaturedDealCheckout(dealId: string, founderEmail: string) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Featured Deal Placement',
            description: 'Promote your deal to the top of LaunchBoost marketplace',
          },
          unit_amount: FEATURED_DEAL_PRICE,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/deals?success=true&deal_id=${dealId}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/deals?canceled=true`,
    customer_email: founderEmail,
    metadata: {
      deal_id: dealId,
      type: 'featured_deal',
    },
  })

  return session
}

// Verify webhook signature
export function verifyWebhookSignature(rawBody: string, signature: string) {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

// Handle successful payment
export async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const dealId = session.metadata?.deal_id
  const adType = session.metadata?.ad_type
  
  if (adType) {
    // Handle advertising spot payment
    return {
      type: 'advertising_spot',
      adType,
      companyName: session.metadata?.company_name,
      websiteUrl: session.metadata?.website_url,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email,
    }
  }
  
  if (dealId) {
    // Handle featured deal payment
    return {
      type: 'featured_deal',
      dealId,
      paymentIntentId: session.payment_intent,
      customerEmail: session.customer_email,
    }
  }
  
  throw new Error('Unknown payment type')
}

// Price formatting utilities
export function formatPrice(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100)
}

export function formatDiscount(originalPrice: number, discountPercentage: number) {
  const discountAmount = (originalPrice * discountPercentage) / 100
  const finalPrice = originalPrice - discountAmount
  
  return {
    originalPrice: formatPrice(originalPrice * 100),
    finalPrice: formatPrice(finalPrice * 100),
    savings: formatPrice(discountAmount * 100),
    discountPercentage: `${discountPercentage}%`,
  }
}