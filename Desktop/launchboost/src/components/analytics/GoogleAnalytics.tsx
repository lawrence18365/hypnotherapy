'use client'
import { useEffect } from 'react'
import { setupGoogleAnalytics } from '@/lib/tracking'

export function GoogleAnalytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return
    
    setupGoogleAnalytics(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
    
    console.log('Google Analytics initialized:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  }, [])
  
  return null
}

// Helper functions for tracking
declare global {
  interface Window {
    gtag: any;
  }
}

export const trackGoogleEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

export const trackGooglePurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency
    })
  }
}