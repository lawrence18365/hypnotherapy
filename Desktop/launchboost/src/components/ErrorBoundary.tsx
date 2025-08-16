'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
  retryCount: number
}

// Error reporting function
async function reportError(error: Error, errorInfo: ErrorInfo, errorId: string, userAgent: string) {
  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId,
        userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null
  private retryTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some(key => prevProps.resetKeys?.includes(key) === false)) {
        this.resetErrorBoundary()
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState(prevState => ({
      error,
      errorInfo,
      retryCount: prevState.retryCount + 1
    }))

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
    
    // Report error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      reportError(error, errorInfo, this.state.errorId, navigator.userAgent)
    }
    
    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error) && this.state.retryCount < 3) {
      this.retryTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary()
      }, 2000 * this.state.retryCount) // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  shouldAutoRetry(error: Error): boolean {
    // Auto-retry for network-related errors
    const retryableErrors = [
      'ChunkLoadError',
      'Loading CSS chunk',
      'Loading chunk',
      'NetworkError',
      'Failed to fetch'
    ]
    
    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError) || error.name.includes(retryableError)
    )
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: '',
      retryCount: 0
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportIssue = () => {
    const subject = encodeURIComponent(`Error Report: ${this.state.errorId}`)
    const body = encodeURIComponent(`Error ID: ${this.state.errorId}\n\nSteps to reproduce:\n1.\n2.\n3.\n\nExpected behavior:\n\nActual behavior:\n`)
    window.open(`mailto:support@launchboost.com?subject=${subject}&body=${body}`, '_blank')
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isRetrying = this.state.retryCount > 0 && this.shouldAutoRetry(this.state.error!)
      const canRetry = this.state.retryCount < 3

      return (
        <div className="min-h-screen bg-[#fbf55c] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-black p-8 max-w-md text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
              <i className={`fas ${isRetrying ? 'fa-sync-alt animate-spin' : 'fa-exclamation-triangle'} text-[#fbf55c] text-2xl`}></i>
            </div>
            
            <h2 className="text-2xl font-bold text-black mb-4">
              {isRetrying ? 'Retrying...' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-700 mb-4">
              {isRetrying 
                ? `Attempting to recover (${this.state.retryCount}/3)...`
                : 'We encountered an unexpected error. Our team has been notified and is working on a fix.'
              }
            </p>

            {!isRetrying && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please include this ID when reporting the issue.
                </p>
              </div>
            )}
            
            {!isRetrying && (
              <div className="space-y-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-black text-[#fbf55c] px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-refresh mr-2"></i>
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-white text-black border-2 border-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-home mr-2"></i>
                  Go Home
                </button>
                
                <button
                  onClick={this.handleReportIssue}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-bug mr-2"></i>
                  Report Issue
                </button>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-600">
                  <i className="fas fa-code mr-1"></i>
                  Error Details (Development)
                </summary>
                <div className="mt-2 text-xs bg-gray-100 p-3 rounded max-h-40 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.toString()}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}