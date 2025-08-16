import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...')
    
    // Test 2: Check if feedback_submissions table exists and has data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback_submissions')
      .select('*')
      .limit(10)
    
    console.log('Feedback query result:', { feedbackData, feedbackError })
    
    // Test 3: Check if feedback_upvotes table exists  
    const { data: upvotesData, error: upvotesError } = await supabase
      .from('feedback_upvotes')
      .select('*')
      .limit(10)
      
    console.log('Upvotes query result:', { upvotesData, upvotesError })
    
    // Test 4: Try to insert a test feedback
    const { data: insertData, error: insertError } = await supabase
      .from('feedback_submissions')
      .insert({
        subject: 'Test feedback submission',
        message: 'This is a test to verify database connectivity',
        feedback_type: 'feature_request',
        contact_name: 'Test User',
        contact_email: 'test@example.com',
        status: 'new'
      })
      .select()
      .single()
      
    console.log('Insert test result:', { insertData, insertError })
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: 'OK',
        feedbackTable: {
          exists: !feedbackError,
          error: feedbackError?.message,
          rowCount: feedbackData?.length || 0,
          data: feedbackData
        },
        upvotesTable: {
          exists: !upvotesError,
          error: upvotesError?.message,
          rowCount: upvotesData?.length || 0
        },
        insertTest: {
          success: !insertError,
          error: insertError?.message,
          data: insertData
        }
      }
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
}