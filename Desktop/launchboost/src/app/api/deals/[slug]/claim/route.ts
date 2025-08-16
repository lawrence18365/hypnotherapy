import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/server/db'
import { requireAuth } from '@/lib/server/auth'
import { sendDealCodeEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Verify user authentication
    const user = await requireAuth()
    const supabase = createServerComponentClient()

    // Get the deal by slug or ID
    let deal = null

    // Try by slug first
    const { data: dealBySlug, error: slugError } = await supabase
      .from('deals')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'live')
      .single()

    if (dealBySlug && !slugError) {
      deal = dealBySlug
    } else {
      // Try by ID
      const { data: dealById, error: idError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', slug)
        .eq('status', 'live')
        .single()

      if (dealById && !idError) {
        deal = dealById
      } else {
        return NextResponse.json(
          { error: 'Deal not found or not available' },
          { status: 404 }
        )
      }
    }

    // Check if deal is expired
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This deal has expired' },
        { status: 400 }
      )
    }

    // Check if user has already claimed this deal
    const { data: existingClaim, error: claimCheckError } = await supabase
      .from('deal_codes')
      .select('*')
      .eq('deal_id', deal.id)
      .eq('user_id', user.id)
      .single()

    if (existingClaim && !claimCheckError) {
      return NextResponse.json(
        { error: 'You have already claimed this deal' },
        { status: 400 }
      )
    }

    // Find an available code
    const { data: availableCode, error: codeError } = await supabase
      .from('deal_codes')
      .select('*')
      .eq('deal_id', deal.id)
      .eq('is_claimed', false)
      .limit(1)
      .single()

    if (codeError || !availableCode) {
      return NextResponse.json(
        { error: 'No more codes available for this deal' },
        { status: 400 }
      )
    }

    // Claim the code
    const { data: claimedCode, error: updateError } = await supabase
      .from('deal_codes')
      .update({
        is_claimed: true,
        user_id: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', availableCode.id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to claim code:', updateError)
      return NextResponse.json(
        { error: 'Failed to claim deal code' },
        { status: 500 }
      )
    }

    // Update deal's remaining codes count
    const { data: updatedDeal, error: dealUpdateError } = await supabase
      .from('deals')
      .update({
        codes_remaining: Math.max(0, (deal.codes_remaining || deal.total_codes) - 1),
        conversions_count: (deal.conversions_count || 0) + 1
      })
      .eq('id', deal.id)
      .select()
      .single()

    if (dealUpdateError) {
      console.error('Failed to update deal stats:', dealUpdateError)
      // Don't fail the request, code was already claimed
    }

    // Send email notification with the code
    try {
      await sendDealCodeEmail(
        user.email,
        deal.title,
        claimedCode.code,
        deal.redemption_instructions
      )
      console.log('Deal code email sent successfully to:', user.email)
    } catch (emailError) {
      console.error('Failed to send deal code email:', emailError)
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Deal claimed successfully!',
      code: claimedCode.code,
      deal: {
        id: deal.id,
        title: deal.title,
        product_name: deal.product_name,
        product_website: deal.product_website
      }
    })

  } catch (error) {
    console.error('Error claiming deal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}