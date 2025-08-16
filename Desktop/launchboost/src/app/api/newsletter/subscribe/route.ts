import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Parse the request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    
    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    
    if (existingSubscriber) {
      return NextResponse.json({ 
        success: true, 
        message: 'You are already subscribed to our newsletter!'
      })
    }
    
    // Insert new subscriber
    const { data: subscriber, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        source: 'homepage_modal',
        subscribed_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting newsletter subscriber:', insertError)
      return NextResponse.json({ 
        error: 'Unable to subscribe at this time. Please try again.' 
      }, { status: 500 })
    }
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email)
      console.log('Welcome email sent successfully to:', email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the whole request if email fails
    }
    
    console.log('New newsletter subscriber:', subscriber)
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully subscribed! Check your email for confirmation.',
      subscriber: subscriber
    })
    
  } catch (error) {
    console.error('Error in newsletter subscription:', error)
    return NextResponse.json({ 
      error: 'Internal server error. Please try again.' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get subscriber count for social proof
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    if (error) {
      console.error('Error getting subscriber count:', error)
      return NextResponse.json({ count: 0 })
    }
    
    return NextResponse.json({ count: count || 0 })
    
  } catch (error) {
    console.error('Error getting subscriber count:', error)
    return NextResponse.json({ count: 0 })
  }
}
