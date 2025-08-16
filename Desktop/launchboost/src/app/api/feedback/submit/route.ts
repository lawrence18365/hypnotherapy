import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { cookies } from 'next/headers'
import { sendAdminNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Parse the request body
    const feedbackData = await request.json()
    
    // Validate required fields
    const { subject, message, feedbackType, userId, name, email, rating, dealUrl } = feedbackData
    
    if (!subject || !message || !feedbackType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // For deal reviews, ensure we have a deal reference and rating
    if (feedbackType === 'deal_review' && (!dealUrl || rating === 0)) {
      return NextResponse.json({ error: 'Deal reviews require a deal reference and rating' }, { status: 400 })
    }
    
    // Insert feedback into database
    const { data: feedback, error: insertError } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: userId || null,
        feedback_type: feedbackType,
        subject: subject,
        message: message,
        rating: feedbackType === 'deal_review' ? rating : null,
        deal_reference: feedbackType === 'deal_review' ? dealUrl : null,
        contact_name: name || null,
        contact_email: email || null,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return NextResponse.json({ 
        error: 'Failed to submit feedback. Please try again.' 
      }, { status: 500 })
    }
    
    // Send notification email to admin
    try {
      const notificationSubject = `New ${feedbackType.replace('_', ' ')} submitted`
      const notificationMessage = `
        <strong>Type:</strong> ${feedbackType}<br>
        <strong>Subject:</strong> ${subject}<br>
        <strong>From:</strong> ${name || 'Anonymous'} ${email ? `(${email})` : ''}<br>
        ${rating ? `<strong>Rating:</strong> ${rating}/5<br>` : ''}
        ${dealUrl ? `<strong>Deal:</strong> ${dealUrl}<br>` : ''}
        <br>
        <strong>Message:</strong><br>
        ${message.replace(/\n/g, '<br>')}
      `
      
      await sendAdminNotification(notificationSubject, notificationMessage)
      console.log('Admin notification sent successfully')
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
      // Don't fail the whole request if email fails
    }
    
    // TODO: If it's a deal review and user is authenticated, also create a deal review record
    
    console.log('Feedback submitted successfully:', feedback)
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedback
    })
    
  } catch (error) {
    console.error('Error in feedback submission:', error)
    return NextResponse.json({
      error: 'Internal server error. Please try again.'
    }, { status: 500 })
  }
}