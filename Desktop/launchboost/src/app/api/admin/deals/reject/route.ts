import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAdmin } from '@/lib/server/auth'

export async function POST(req: NextRequest) {
  try {
    const { dealId, reason } = await req.json()

    if (!dealId || !reason?.trim()) {
      return NextResponse.json({ error: 'Deal ID and rejection reason are required' }, { status: 400 })
    }

    // Verify admin authentication with proper profile checking
    const { user, profile } = await requireAdmin()
    
    console.log('Reject deal API called by:', user.email, 'Role:', profile.role)

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

    // Update deal status to rejected
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId)

    if (updateError) {
      console.error('Error rejecting deal:', updateError)
      return NextResponse.json({ error: 'Failed to reject deal' }, { status: 500 })
    }

    // Log admin action
    try {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'reject_deal',
          target_id: dealId,
          notes: `Rejected deal: ${deal.title}. Reason: ${reason.trim()}`,
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
          type: 'deal_rejected',
          title: 'Deal Requires Revision',
          message: `Your deal "${deal.title}" needs some updates before approval. Reason: ${reason.trim()}`,
          deal_id: dealId,
          created_at: new Date().toISOString()
        })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Deal rejected successfully',
      deal: {
        id: deal.id,
        title: deal.title,
        status: 'rejected',
        rejection_reason: reason.trim()
      }
    })

  } catch (error) {
    console.error('Admin reject deal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}