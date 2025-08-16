import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAdmin } from '@/lib/server/auth'

export async function POST(req: NextRequest) {
  try {
    const { dealId } = await req.json()

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
    }

    // Verify admin authentication with proper profile checking
    const { user, profile } = await requireAdmin()
    
    console.log('Admin API called by:', user.email, 'Role:', profile.role)

    const supabase = createServerComponentClient()

    // Get deal information first
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*, founder:profiles!deals_founder_id_fkey(email, full_name)')
      .eq('id', dealId)
      .eq('status', 'pending_review')
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found or not pending review' }, { status: 404 })
    }

    // Update deal status to live
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        status: 'live',
        starts_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId)

    if (updateError) {
      console.error('Error approving deal:', updateError)
      return NextResponse.json({ error: 'Failed to approve deal' }, { status: 500 })
    }

    // Generate deal codes
    try {
      const { error: codesError } = await supabase
        .rpc('generate_deal_codes', {
          deal_id: dealId,
          code_count: deal.total_codes
        })

      if (codesError) {
        console.error('Error generating codes:', codesError)
        // Don't fail the approval, but log the error
      }
    } catch (codeError) {
      console.error('Code generation error:', codeError)
    }

    // Log admin action
    try {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: profile.id,
          action_type: 'approve_deal',
          target_id: dealId,
          notes: `Approved deal: ${deal.title}`,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('Failed to log admin action:', logError)
    }

    // Create notification for founder
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: deal.founder_id,
          type: 'deal_approved',
          title: 'Deal Approved!',
          message: `Your deal "${deal.title}" has been approved and is now live on LaunchBoost.`,
          deal_id: dealId,
          created_at: new Date().toISOString()
        })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Deal approved successfully',
      deal: {
        id: deal.id,
        title: deal.title,
        status: 'live'
      }
    })

  } catch (error) {
    console.error('Admin approve deal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}