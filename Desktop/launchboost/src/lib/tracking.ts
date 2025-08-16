/**
 * Error Tracking and Analytics Configuration
 * Basic setup that can be extended with Sentry, LogRocket, etc.
 */

interface ErrorTrackingEvent {
  message: string
  stack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  sessionId: string
}

interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  timestamp: string
}

class ErrorTracker {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandlers()
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Unhandled JavaScript errors
      window.addEventListener('error', (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
          url: event.filename || window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          userId: this.userId
        })
      })

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
          userId: this.userId
        })
      })
    }
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  captureError(error: ErrorTrackingEvent): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', error)
    }

    // In production, send to your error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to backend error logging endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    }
  }

  // Manual error capture for try-catch blocks
  captureException(error: Error, context?: Record<string, any>): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      ...context
    })
  }
}

class Analytics {
  private userId?: string

  setUserId(userId: string): void {
    this.userId = userId
  }

  track(event: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category: properties?.category || 'General',
      action: properties?.action || event,
      label: properties?.label,
      value: properties?.value,
      userId: this.userId,
      timestamp: new Date().toISOString()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', analyticsEvent)
    }

    // Send to Google Analytics (if configured)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: analyticsEvent.category,
        event_label: analyticsEvent.label,
        value: analyticsEvent.value,
        user_id: this.userId
      })
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      }).catch(() => {
        // Silently fail if analytics fails
      })
    }
  }

  // Common events
  pageView(page: string): void {
    this.track('page_view', {
      category: 'Navigation',
      action: 'page_view',
      label: page
    })
  }

  dealView(dealId: string, dealTitle: string): void {
    this.track('deal_view', {
      category: 'Deals',
      action: 'view',
      label: dealTitle,
      value: dealId
    })
  }

  dealClaim(dealId: string, dealTitle: string): void {
    this.track('deal_claim', {
      category: 'Deals',
      action: 'claim',
      label: dealTitle,
      value: dealId
    })
  }

  signup(method: string): void {
    this.track('signup', {
      category: 'Auth',
      action: 'signup',
      label: method
    })
  }

  login(method: string): void {
    this.track('login', {
      category: 'Auth',
      action: 'login',
      label: method
    })
  }
}

// Export singleton instances
export const errorTracker = new ErrorTracker()
export const analytics = new Analytics()

// Google Analytics setup
export function setupGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  script.async = true
  document.head.appendChild(script)

  // Initialize gtag
  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) {
    ;(window as any).dataLayer.push(args)
  }
  ;(window as any).gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href
  })
}