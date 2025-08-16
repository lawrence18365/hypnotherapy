import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/server/db'
import { getCurrentUserServer } from '@/lib/server/auth'
import { cookies } from 'next/headers'

// GET - Fetch all public feedback submissions (tickets)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get current user for upvote status (optional)
    let user = null
    try {
      user = await getCurrentUserServer()
    } catch {
      // User not authenticated, continue without user context
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    console.log('Fetching tickets from Supabase...')
    
    try {
      // Simple query first - just get feedback submissions
      let query = supabase
        .from('feedback_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (status !== 'all') {
      // Map frontend status values to database status values
        const statusMapping = {
          'open': 'new',
          'in_progress': 'in_review', 
        'completed': 'resolved',
          'closed': 'dismissed'
      }
      const dbStatus = statusMapping[status] || status
      query = query.eq('status', dbStatus)
    }
    
    if (type !== 'all') {
      // Map frontend type values to database type values
      const typeMapping = {
        'improvement': 'general',
        'question': 'general'
      }
      const dbType = typeMapping[type] || type
      query = query.eq('feedback_type', dbType)
    }

      const { data: tickets, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        // Return empty array instead of sample data
        return NextResponse.json({ 
          tickets: [],
          usingFallback: false,
          error: 'No feedback submissions found. Be the first to submit feedback!'
        })
      }

      console.log(`Found ${tickets?.length || 0} tickets in database`)

      if (!tickets || tickets.length === 0) {
        console.log('No tickets found in database')
        return NextResponse.json({ 
          tickets: [],
          usingFallback: false
        })
      }

      // Get upvote counts for each ticket
      const ticketIds = tickets.map(ticket => ticket.id)
      let upvoteCounts = {}
      let userUpvotes = new Set()
      
      if (ticketIds.length > 0) {
        try {
          // Get upvote counts
          const { data: upvoteData, error: upvoteError } = await supabase
            .from('feedback_upvotes')
            .select('feedback_submission_id, user_id')
            .in('feedback_submission_id', ticketIds)
          
          if (!upvoteError && upvoteData) {
            // Count upvotes per ticket
            upvoteData.forEach(upvote => {
              const ticketId = upvote.feedback_submission_id
              upvoteCounts[ticketId] = (upvoteCounts[ticketId] || 0) + 1
              
              // Track if current user has upvoted
              if (user && upvote.user_id === user.id) {
                userUpvotes.add(ticketId)
              }
            })
          }
        } catch (upvoteError) {
          console.log('Could not fetch upvotes, continuing without upvote data')
        }
      }

      // Transform feedback submissions to ticket format
      const transformedTickets = tickets.map(ticket => {
        // Map database values to frontend values
        const frontendType = {
          'general': 'improvement',
          'deal_review': 'improvement', 
          'bug_report': 'bug_report',
          'feature_request': 'feature_request'
        }[ticket.feedback_type] || ticket.feedback_type
        
        const frontendStatus = {
          'new': 'open',
          'in_review': 'in_progress',
          'resolved': 'completed', 
          'dismissed': 'closed'
        }[ticket.status] || ticket.status
        
        return {
          id: ticket.id,
          title: ticket.subject,
          description: ticket.message,
          ticket_type: frontendType,
          status: frontendStatus,
          priority: 'medium',
          rating: ticket.rating,
          deal_reference: ticket.deal_reference,
          author_name: ticket.contact_name,
          author_email: ticket.contact_email,
          user_id: ticket.user_id,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          profiles: null, // Simplified - no join for now
          upvotes_count: upvoteCounts[ticket.id] || 0,
          user_has_upvoted: userUpvotes.has(ticket.id),
          comments_count: 0 // Not implemented yet
        }
      })

      return NextResponse.json({ 
        tickets: transformedTickets,
        usingFallback: false
      })

    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ 
        tickets: [],
        usingFallback: false,
        error: 'Database connection failed. Please check your Supabase configuration.'
      })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      tickets: [],
      usingFallback: false,
      error: 'API error occurred. Please try again.'
    })
  }
}

// POST - Create a new ticket (feedback submission)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient(cookieStore)
    
    // Get current user (optional for anonymous submissions)
    let user = null
    try {
      user = await getCurrentUserServer()
    } catch {
      // User not authenticated, allow anonymous submission
    }
    
    const ticketData = await request.json()
    
    const { title, description, ticket_type, author_name, author_email, rating } = ticketData
    
    // Validate required fields
    if (!title || !description || !ticket_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // For anonymous users, require at least a name
    if (!user && !author_name) {
      return NextResponse.json({ error: 'Name is required for anonymous submissions' }, { status: 400 })
    }
    
    try {
      // Map frontend type to database type
      const dbTypeMapping = {
        'improvement': 'general',
        'question': 'general',
        'bug_report': 'bug_report',
        'feature_request': 'feature_request'
      }
      const dbType = dbTypeMapping[ticket_type] || ticket_type
      
      // Insert as feedback submission
      const { data: feedback, error: insertError } = await supabase
        .from('feedback_submissions')
        .insert({
          user_id: user?.id || null,
          subject: title,
          message: description,
          feedback_type: dbType,
          rating: rating || null,
          contact_name: user ? (user.user_metadata?.full_name || null) : author_name,
          contact_email: user ? user.email : author_email,
          status: 'new',
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ 
          error: 'Failed to create ticket. Please try again.',
          details: insertError.message
        }, { status: 500 })
      }
      
      // Transform to ticket format
      const frontendType = {
        'general': 'improvement',
        'deal_review': 'improvement', 
        'bug_report': 'bug_report',
        'feature_request': 'feature_request'
      }[feedback.feedback_type] || feedback.feedback_type
      
      const frontendStatus = {
        'new': 'open',
        'in_review': 'in_progress',
        'resolved': 'completed', 
        'dismissed': 'closed'
      }[feedback.status] || feedback.status
      
      const ticket = {
        id: feedback.id,
        title: feedback.subject,
        description: feedback.message,
        ticket_type: frontendType,
        status: frontendStatus,
        priority: 'medium',
        rating: feedback.rating,
        author_name: feedback.contact_name,
        author_email: feedback.contact_email,
        user_id: feedback.user_id,
        created_at: feedback.created_at,
        profiles: null,
        upvotes_count: 0,
        comments_count: 0,
        slug: feedback.id // Use ID as slug for now
      }
      
      return NextResponse.json({ 
        success: true,
        ticket,
        message: 'Ticket created successfully!'
      })
      
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Database error. Please try again.',
        details: dbError.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Ticket creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}