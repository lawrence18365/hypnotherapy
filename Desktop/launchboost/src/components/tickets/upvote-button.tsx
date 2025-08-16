"use client"

import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UpvoteButtonProps {
  ticketId: string
  initialCount: number
  initialUpvoted?: boolean
  disabled?: boolean
  className?: string
}

export function UpvoteButton({ 
  ticketId, 
  initialCount, 
  initialUpvoted = false, 
  disabled = false,
  className = "" 
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialCount)
  const [hasUpvoted, setHasUpvoted] = useState(initialUpvoted)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleUpvote = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    setIsAnimating(true)

    try {
      const response = await fetch(`/api/tickets/${ticketId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to sign-in if not authenticated
          window.location.href = '/sign-in'
          return
        }
        throw new Error('Failed to toggle upvote')
      }

      const data = await response.json()
      
      if (data.success) {
        setUpvotes(data.upvotes_count)
        setHasUpvoted(data.hasUpvoted)
        
        // Add extra animation delay for satisfying feedback
        setTimeout(() => setIsAnimating(false), 300)
      } else {
        throw new Error(data.error || 'Upvote failed')
      }
    } catch (error) {
      console.error('Upvote error:', error)
      // Revert optimistic update
      setUpvotes(initialCount)
      setHasUpvoted(initialUpvoted)
      setIsAnimating(false)
      
      // Show error message
      alert('Failed to upvote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
      size="sm"
      onClick={handleUpvote}
      disabled={isLoading || disabled}
      className={cn(
        "relative overflow-hidden flex flex-col items-center p-2 h-auto min-w-[60px] transition-all duration-300 ease-out",
        hasUpvoted 
          ? "bg-black text-yellow-400 border-black hover:bg-gray-800 shadow-lg transform hover:scale-105" 
          : "border-black text-black hover:bg-black hover:text-yellow-400 hover:shadow-md transform hover:scale-102",
        isAnimating && "animate-bounce",
        isLoading && "opacity-75 cursor-not-allowed",
        className
      )}
    >
      {/* Animated background pulse for successful upvotes */}
      {isAnimating && hasUpvoted && (
        <>
          <div className="absolute inset-0 bg-yellow-400 opacity-30 animate-ping rounded-md" />
          <div className="absolute inset-0 bg-yellow-400 opacity-20 animate-pulse rounded-md" />
        </>
      )}
      
      {/* Success burst effect */}
      {isAnimating && hasUpvoted && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '100ms' }} />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
        </div>
      )}
      
      {/* Arrow with rotation and bounce animation */}
      <ArrowUp 
        className={cn(
          "h-4 w-4 transition-all duration-300 ease-out",
          isAnimating && hasUpvoted && "transform rotate-12 scale-125 animate-pulse",
          isAnimating && !hasUpvoted && "transform -rotate-12 scale-90",
          hasUpvoted && "drop-shadow-sm filter brightness-110"
        )} 
      />
      
      {/* Count with satisfying number animation */}
      <span 
        className={cn(
          "text-xs font-bold transition-all duration-300 ease-out",
          isAnimating && hasUpvoted && "transform scale-125 animate-pulse text-yellow-300",
          isAnimating && !hasUpvoted && "transform scale-90",
          hasUpvoted && "drop-shadow-sm filter brightness-110"
        )}
      >
        {upvotes}
      </span>
      
      {/* Loading spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}
      
      {/* Ripple effect on click */}
      {isAnimating && (
        <div className="absolute inset-0 bg-current opacity-20 animate-pulse rounded-md" />
      )}
    </Button>
  )
}