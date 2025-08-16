import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'

// Input validation and sanitization utilities
function sanitizeText(input: string, maxLength: number = 255): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, (match) => {
      const htmlEntities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return htmlEntities[match] || match
    })
    .trim()
    .substring(0, maxLength)
}

function validateURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol) && 
           !urlObj.hostname.includes('localhost') &&
           !urlObj.hostname.includes('127.0.0.1') &&
           urlObj.hostname.length > 0
  } catch {
    return false
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

function validatePrice(price: any): number | null {
  const numPrice = parseFloat(price)
  if (isNaN(numPrice) || numPrice < 0 || numPrice > 10000) {
    return null
  }
  return Math.round(numPrice * 100) // Convert to cents
}

function validateQuantity(qty: any): number | null {
  const numQty = parseInt(qty)
  if (isNaN(numQty) || numQty < 1 || numQty > 10000) {
    return null
  }
  return numQty
}

function validateDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const maxFuture = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 year
  return !isNaN(date.getTime()) && date > now && date < maxFuture
}

function validateTags(tags: any): string[] {
  if (!Array.isArray(tags)) return []
  return tags
    .filter(tag => typeof tag === 'string')
    .map(tag => sanitizeText(tag, 50))
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Max 10 tags
}

function validateDiscountCode(code: string): boolean {
  return /^[A-Za-z0-9-_]{3,50}$/.test(code)
}

function validateDiscountCodes(discountCodes: any): { type: string; codes?: string[]; code?: string } | null {
  if (!discountCodes || typeof discountCodes !== 'object') {
    return null
  }

  if (discountCodes.type === 'universal') {
    if (typeof discountCodes.code !== 'string' || !validateDiscountCode(discountCodes.code)) {
      return null
    }
    return {
      type: 'universal',
      code: discountCodes.code.trim().toUpperCase()
    }
  } else if (discountCodes.type === 'unique') {
    if (!Array.isArray(discountCodes.codes) || discountCodes.codes.length === 0) {
      return null
    }
    const validCodes = discountCodes.codes
      .filter(code => typeof code === 'string')
      .map(code => code.trim().toUpperCase())
      .filter(code => validateDiscountCode(code))
    
    if (validCodes.length === 0 || validCodes.length > 10000) {
      return null
    }
    
    // Remove duplicates
    const uniqueCodes = [...new Set(validCodes)]
    return {
      type: 'unique',
      codes: uniqueCodes
    }
  }
  
  return null
}

// Rate limiting for deal submissions
const submissionAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_SUBMISSIONS = 3
const SUBMISSION_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded ? forwarded.split(',')[0].trim() : realIP || 'unknown'
}

function isSubmissionRateLimited(userId: string, ip: string): boolean {
  const key = `${userId}_${ip}`
  const now = Date.now()
  const record = submissionAttempts.get(key)
  
  if (!record) {
    submissionAttempts.set(key, { count: 1, lastAttempt: now })
    return false
  }
  
  if (now - record.lastAttempt > SUBMISSION_WINDOW_MS) {
    submissionAttempts.set(key, { count: 1, lastAttempt: now })
    return false
  }
  
  if (record.count >= MAX_SUBMISSIONS) {
    return true
  }
  
  record.count++
  record.lastAttempt = now
  return false
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request)
  
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn(`Unauthorized deal submission attempt from IP: ${clientIP}`)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Rate limiting check
    if (isSubmissionRateLimited(user.id, clientIP)) {
      console.warn(`Rate limited deal submission from user: ${user.id}, IP: ${clientIP}`)
      return NextResponse.json({
        error: 'Too many submissions. Please wait before submitting another deal.'
      }, { status: 429 })
    }
    
    // Parse and validate request body size
    const requestBody = await request.text()
    if (requestBody.length > 50000) { // 50KB limit
      return NextResponse.json({
        error: 'Request body too large'
      }, { status: 413 })
    }

    let dealData
    try {
      dealData = JSON.parse(requestBody)
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid JSON format'
      }, { status: 400 })
    }
    
    // Validate required fields with type checking
    const requiredFields = {
      productName: 'string',
      productWebsite: 'string', 
      title: 'string',
      description: 'string',
      shortDescription: 'string',
      category: 'string',
      originalPrice: 'number',
      dealPrice: 'number',
      totalCodes: 'number',
      expiresAt: 'string',
      pricingTier: 'string'
    }
    
    for (const [field, expectedType] of Object.entries(requiredFields)) {
      if (dealData[field] === undefined || dealData[field] === null) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
      
      if (expectedType === 'string' && typeof dealData[field] !== 'string') {
        return NextResponse.json({ 
          error: `Field ${field} must be a string` 
        }, { status: 400 })
      }
      
      if (expectedType === 'number' && (typeof dealData[field] !== 'number' && isNaN(Number(dealData[field])))) {
        return NextResponse.json({ 
          error: `Field ${field} must be a valid number` 
        }, { status: 400 })
      }
    }

    // Sanitize and validate all inputs
    const productName = sanitizeText(dealData.productName, 100)
    const title = sanitizeText(dealData.title, 200)
    const description = sanitizeText(dealData.description, 5000)
    const shortDescription = sanitizeText(dealData.shortDescription, 500)
    const redemptionInstructions = dealData.redemptionInstructions ? sanitizeText(dealData.redemptionInstructions, 1000) : null
    
    if (!productName || !title || !description || !shortDescription) {
      return NextResponse.json({
        error: 'Product name, title, description, and short description cannot be empty'
      }, { status: 400 })
    }

    // Validate URLs
    if (!validateURL(dealData.productWebsite)) {
      return NextResponse.json({
        error: 'Invalid product website URL'
      }, { status: 400 })
    }

    if (dealData.iconUrl && !validateURL(dealData.iconUrl)) {
      return NextResponse.json({
        error: 'Invalid icon URL'
      }, { status: 400 })
    }

    // Validate pricing
    const originalPrice = validatePrice(dealData.originalPrice)
    const dealPrice = validatePrice(dealData.dealPrice)
    
    if (originalPrice === null || dealPrice === null) {
      return NextResponse.json({
        error: 'Invalid pricing. Prices must be between $0 and $10,000'
      }, { status: 400 })
    }

    if (dealPrice >= originalPrice) {
      return NextResponse.json({
        error: 'Deal price must be less than original price'
      }, { status: 400 })
    }

    // Calculate actual total codes based on discount codes provided
    let actualTotalCodes: number
    if (validatedDiscountCodes.type === 'universal') {
      // For universal codes, use the provided totalCodes or default to a reasonable number
      actualTotalCodes = validateQuantity(dealData.totalCodes) || 1000
    } else {
      // For unique codes, total codes is the number of actual codes provided
      actualTotalCodes = validatedDiscountCodes.codes!.length
    }
    
    if (actualTotalCodes < 1 || actualTotalCodes > 10000) {
      return NextResponse.json({
        error: 'Invalid total codes. Must be between 1 and 10,000'
      }, { status: 400 })
    }

    // Validate expiration date
    if (!validateDate(dealData.expiresAt)) {
      return NextResponse.json({
        error: 'Invalid expiration date. Must be a future date within 1 year'
      }, { status: 400 })
    }

    // Validate and sanitize tags
    const tags = validateTags(dealData.tags)
    
    // Validate discount codes
    const validatedDiscountCodes = validateDiscountCodes(dealData.discountCodes)
    if (!validatedDiscountCodes) {
      return NextResponse.json({
        error: 'Invalid discount codes. Please provide either a valid universal code or upload a file with valid unique codes.'
      }, { status: 400 })
    }
    
    // Validate pricing tier (must match database enum)
    const allowedTiers = ['free', 'featured', 'pro']
    if (!allowedTiers.includes(dealData.pricingTier)) {
      return NextResponse.json({ error: `Invalid pricing tier. Must be one of: ${allowedTiers.join(', ')}` }, { status: 400 })
    }

    // For paid tiers, verify payment completion
    if (dealData.pricingTier === 'featured' || dealData.pricingTier === 'pro') {
      // Check if user has an unused payment for this listing tier
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'succeeded')
        .eq('payment_type', 'listing_fee')
        .eq('listing_tier', dealData.pricingTier)
        .is('used_for_deal_id', null) // Only get unused payments
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (paymentError || !payment) {
        return NextResponse.json({ 
          error: 'Payment required for this listing tier. Please complete payment first.',
          requiresPayment: true
        }, { status: 402 })
      }

      // Check if payment is recent (within last 24 hours) to prevent expired payments
      const paymentDate = new Date(payment.created_at)
      const now = new Date()
      const hoursSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSincePayment > 24) {
        return NextResponse.json({ 
          error: 'Payment session expired. Please make a new payment.',
          requiresPayment: true
        }, { status: 402 })
      }

      // Reserve this payment for this deal submission
      const tempDealId = `temp_${user.id}_${Date.now()}`
      const { error: reserveError } = await supabase
        .from('payments')
        .update({ used_for_deal_id: tempDealId })
        .eq('id', payment.id)
        .eq('used_for_deal_id', null) // Ensure it wasn't already used

      if (reserveError) {
        return NextResponse.json({ 
          error: 'Payment already used or expired. Please make a new payment.',
          requiresPayment: true
        }, { status: 402 })
      }

      // Store payment ID for later update
      dealData._paymentId = payment.id
      dealData._tempDealId = tempDealId
    }
    
    // Validate category is in the allowed enum list
    const allowedCategories = [
      "AI & Machine Learning", "Analytics & Data", "Business & Finance", 
      "Communication & Collaboration", "Design & Creative", "Developer Tools",
      "E-commerce & Retail", "Education & Learning", "Healthcare & Wellness",
      "HR & Recruiting", "Marketing & Growth", "Productivity & Organization",
      "Sales & CRM", "Security & Privacy", "Social & Community"
    ]
    
    if (!allowedCategories.includes(dealData.category)) {
      return NextResponse.json({ error: `Invalid category. Must be one of: ${allowedCategories.join(', ')}` }, { status: 400 })
    }
    
    // Calculate discount percentage (prices already converted to cents above)
    const discountPercentage = Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
    
    // Validate discount is reasonable
    if (discountPercentage < 10) {
      return NextResponse.json({
        error: 'Discount must be at least 10%'
      }, { status: 400 })
    }
    
    // Set features based on pricing tier
    const isFeatureTier = dealData.pricingTier === 'featured' || dealData.pricingTier === 'pro'
    const featuredDays = dealData.pricingTier === 'pro' ? 30 : 15 // Pro: 30 days, Featured: 15 days
    const featuredUntil = isFeatureTier ? new Date(Date.now() + featuredDays * 24 * 60 * 60 * 1000).toISOString() : null
    
    // Generate URL-friendly slug from title
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    }
    
    const slug = generateSlug(title) + '-' + Date.now() // Add timestamp for uniqueness
    
    // Check for duplicate slugs
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existingDeal) {
      return NextResponse.json({
        error: 'A deal with this title already exists. Please use a different title.'
      }, { status: 409 })
    }
    
    // Insert deal into database with sanitized data
    const { data: deal, error: insertError } = await supabase
      .from('deals')
      .insert({
        founder_id: user.id,
        product_name: productName,
        product_website: dealData.productWebsite,
        title: title,
        slug: slug,
        description: description,
        short_description: shortDescription,
        category: dealData.category,
        original_price: originalPrice,
        deal_price: dealPrice,
        total_codes: actualTotalCodes,
        expires_at: dealData.expiresAt,
        tags: tags,
        pricing_tier: dealData.pricingTier,
        status: 'pending_review',
        is_featured: isFeatureTier,
        featured_until: featuredUntil,
        deal_type: 'discount',
        product_logo_url: dealData.iconUrl || null,
        code_type: validatedDiscountCodes.type,
        redemption_instructions: redemptionInstructions
      })
      .select()
      .single()
    
    if (insertError) {
      // If deal insertion failed and we had a payment, release the payment reservation
      if (dealData._paymentId && dealData._tempDealId) {
        await supabase
          .from('payments')
          .update({ used_for_deal_id: null })
          .eq('id', dealData._paymentId)
          .eq('used_for_deal_id', dealData._tempDealId)
      }
      return NextResponse.json({ error: 'Failed to submit deal', details: insertError.message }, { status: 500 })
    }
    
    // Insert discount codes into deal_codes table
    if (validatedDiscountCodes.type === 'universal') {
      // For universal codes, create one record that represents the universal code
      const { error: codeInsertError } = await supabase
        .from('deal_codes')
        .insert({
          deal_id: deal.id,
          code: validatedDiscountCodes.code!,
          is_universal: true,
          is_claimed: false
        })
      
      if (codeInsertError) {
        console.error('Failed to insert universal code:', codeInsertError)
        // Don't fail the entire submission for code insertion errors
      }
    } else {
      // For unique codes, create individual records for each code
      const codeRecords = validatedDiscountCodes.codes!.map(code => ({
        deal_id: deal.id,
        code: code,
        is_universal: false,
        is_claimed: false
      }))
      
      // Insert codes in batches of 1000 to avoid query size limits
      const batchSize = 1000
      for (let i = 0; i < codeRecords.length; i += batchSize) {
        const batch = codeRecords.slice(i, i + batchSize)
        const { error: codeInsertError } = await supabase
          .from('deal_codes')
          .insert(batch)
        
        if (codeInsertError) {
          console.error(`Failed to insert code batch ${i / batchSize + 1}:`, codeInsertError)
          // Don't fail the entire submission for code insertion errors
          break
        }
      }
    }
    
    // Update payment with actual deal ID if this was a paid submission
    if (dealData._paymentId && deal) {
      await supabase
        .from('payments')
        .update({ used_for_deal_id: deal.id })
        .eq('id', dealData._paymentId)
        .eq('used_for_deal_id', dealData._tempDealId)
    }
    
    // Log successful submission
    console.log('Deal submitted successfully:', {
      dealId: deal.id,
      userId: user.id,
      productName: productName,
      pricingTier: dealData.pricingTier,
      ip: clientIP,
      timestamp: new Date().toISOString()
    })

    // Return success with sanitized deal data
    const safeDeal = {
      id: deal.id,
      slug: deal.slug,
      title: deal.title,
      status: deal.status,
      pricing_tier: deal.pricing_tier,
      created_at: deal.created_at
    }
    
    return NextResponse.json({ 
      success: true, 
      deal: safeDeal,
      message: 'Deal submitted successfully for review'
    })
    
  } catch (error) {
    console.error('Deal submission error:', error, 'User:', user?.id, 'IP:', clientIP)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
