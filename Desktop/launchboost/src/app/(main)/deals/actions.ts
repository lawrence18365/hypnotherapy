'use server'

import { createServerComponentClient } from "@/lib/server/db"
import { revalidatePath } from 'next/cache'

export async function claimDealAction(dealCodeId: string) {
  const supabase = createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to claim a deal.' }
  }

  const { data, error } = await supabase
    .from('deal_codes')
    .update({ is_claimed: true, user_id: user.id })
    .eq('id', dealCodeId)
    .select()
    .single()

  if (error) {
    console.error('Failed to claim deal:', error)
    return { error: 'Failed to claim the deal. Please try again.' }
  }

  // This tells Next.js to refresh the data on these pages
  revalidatePath('/')

  return { success: true }
}