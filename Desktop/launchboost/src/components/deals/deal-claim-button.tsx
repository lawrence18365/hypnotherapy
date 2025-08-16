'use client'

import { claimDealAction } from '../../app/(main)/deals/actions'
import { Button } from '@/components/ui/button'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface DealClaimButtonProps {
  dealCodeId: string;
  user: User | null;
  dealTitle?: string;
}

export function DealClaimButton({ dealCodeId, user, dealTitle }: DealClaimButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClaim = async () => {
    if (!user) {
      // Redirect to sign in with return URL
      router.push('/sign-in?returnUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await claimDealAction(dealCodeId)
      if (result?.error) {
        setError(result.error)
      } else {
        alert(`Deal code claimed successfully! Check your email for details.`)
        // The page will automatically show the updated data because of revalidatePath.
      }
    })
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <Button onClick={handleClaim} className="w-full" size="lg">
          Sign In to Claim Deal
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Join LaunchBoost to claim exclusive deals
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClaim} disabled={isPending} className="w-full" size="lg">
        {isPending ? 'Claiming...' : 'Claim Deal'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}