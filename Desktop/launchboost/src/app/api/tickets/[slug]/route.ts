import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { getCurrentUserServer } from '@/lib/server/auth'
import { cookies } from 'next/headers'

// GET - Fetch individual ticket with comments
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    const user = await getCurrentUserServer()
    
    // Extract ID from slug (last 6 characters)
    const slugParts = params.slug.split('-')
    const submissionIdSuffix = slugParts[slugParts.length - 1]
    
    // Find feedback submission by ID suffix
    const { data: submissions, error: submissionError } = await supabase
      .from('feedback_submissions')
      .select(`
        id,
        subject,
        message,
        feedback_type,
        rating,
        deal_reference,
        contact_name,
        contact_email,
        status,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          full_name,
          username,
          avatar_url,
          role
        )
      `)
      .like('id', `%${submissionIdSuffix}`)
    
    if (submissionError || !submissions || submissions.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    
    // If multiple matches, find the one whose slug matches exactly
    let submission = submissions[0]
    if (submissions.length > 1) {
      for (const sub of submissions) {
        const baseSlug = sub.subject
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
        const generatedSlug = `${baseSlug}-${sub.id.slice(-6)}`
        if (generatedSlug === params.slug) {
          submission = sub
          break
        }
      }
    }

    // Get upvote count and check if user has upvoted
    let upvotesCount = 0
    let hasUpvoted = false
    
    // Try to get upvotes from feedback_upvotes table
    const { data: upvotes, error: upvotesError } = await supabase
      .from('feedback_upvotes')
      .select('user_id')
      .eq('feedback_submission_id', submission.id)
    
    if (!upvotesError && upvotes) {
      upvotesCount = upvotes.length
      if (user) {
        hasUpvoted = upvotes.some(upvote => upvote.user_id === user.id)
      }
    }

    // Transform feedback submission to ticket format
    const baseSlug = submission.subject
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    const slug = `${baseSlug}-${submission.id.slice(-6)}`
    
    const ticket = {
      id: submission.id,
      title: submission.subject,
      description: submission.message,
      ticket_type: submission.feedback_type,
      status: submission.status === 'new' ? 'open' : submission.status,
      priority: 'medium',
      rating: submission.rating,
      deal_reference: submission.deal_reference,
      author_name: submission.contact_name,
      author_email: submission.contact_email,
      user_id: submission.profiles?.id,
      slug: slug,
      created_at: submission.created_at,
      updated_at: submission.updated_at,
      profiles: submission.profiles,
      upvotes_count: upvotesCount,
      comments_count: 0, // TODO: Implement comments if needed
      admin_response: null // TODO: Add admin response field if needed
    }

    return NextResponse.json({
      ticket,
      comments: [], // TODO: Implement comments system if needed
      hasUpvoted
    })

  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add comment to ticket (placeholder - not fully implemented)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    return NextResponse.json({ 
      error: 'Comments system not yet implemented for feedback submissions' 
    }, { status: 501 })
    
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}