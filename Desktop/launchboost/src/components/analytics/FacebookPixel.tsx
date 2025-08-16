'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function FacebookPixel() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) return
    
    // Facebook Pixel Code
    ;(function(f: any, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    
    window.fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID!)
    window.fbq('track', 'PageView')
    
    console.log('Facebook Pixel initialized:', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID)
  }, [])
  
  return (
    <>
      {/* Facebook Pixel noscript fallback */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Helper functions for tracking events
export const trackFacebookEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data)
  }
}

export const trackFacebookPurchase = (value: number, currency: string = 'USD') => {
  trackFacebookEvent('Purchase', { value, currency })
}

export const trackFacebookLead = (content_name?: string) => {
  trackFacebookEvent('Lead', { content_name })
}