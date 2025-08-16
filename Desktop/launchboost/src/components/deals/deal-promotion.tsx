"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star, Zap, Crown, Clock, TrendingUp, Shield, Headphones } from 'lucide-react'
import { toast } from 'sonner'

interface DealPromotionProps {
  deal: {
    id: string
    title: string
    pricing_tier: string
    is_featured: boolean
    featured_until?: string
  }
}

export function DealPromotion({ deal }: DealPromotionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [promotingTo, setPromotingTo] = useState<string | null>(null)

  const handlePromote = async (tier: 'featured' | 'pro') => {
    setIsLoading(true)
    setPromotingTo(tier)

    try {
      const response = await fetch(`/api/payments/${tier}-deal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId: deal.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Payment failed')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
      
    } catch (error) {
      console.error('Promotion error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to initiate promotion')
    } finally {
      setIsLoading(false)
      setPromotingTo(null)
    }
  }

  const isAlreadyFeatured = deal.pricing_tier === 'featured' || deal.pricing_tier === 'pro'
  const isAlreadyPro = deal.pricing_tier === 'pro'
  
  const featuredUntil = deal.featured_until ? new Date(deal.featured_until) : null
  const isStillFeatured = featuredUntil && featuredUntil > new Date()

  if (isAlreadyPro) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">LaunchBoost Pro Active</CardTitle>
            <Badge className="bg-green-600 text-white">
              Pro
            </Badge>
          </div>
          <CardDescription className="text-green-700">
            Your deal is receiving premium promotion with all Pro benefits.
            {isStillFeatured && featuredUntil && (
              <span className="block mt-1 font-medium">
                Featured until {featuredUntil.toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isAlreadyFeatured) {
    return (
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Featured Deal Active</CardTitle>
              <Badge className="bg-blue-600 text-white">
                Featured
              </Badge>
            </div>
            <CardDescription className="text-blue-700">
              Your deal is being featured with enhanced visibility.
              {isStillFeatured && featuredUntil && (
                <span className="block mt-1 font-medium">
                  Featured until {featuredUntil.toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Upgrade to Pro option */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <CardTitle>Upgrade to LaunchBoost Pro</CardTitle>
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
                +$60
              </Badge>
            </div>
            <CardDescription>
              Add personal strategy consultation and extended featuring to your current promotion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Personal deal strategy review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Launch optimization advice</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Extended featured duration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Fair use protection</span>
                </div>
              </div>
              <Button 
                onClick={() => handlePromote('pro')}
                disabled={isLoading}
                className="w-full"
              >
                {promotingTo === 'pro' ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Pro - $60</span>
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show promotion options for non-featured deals
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Boost Your Deal's Visibility</h3>
        <p className="text-muted-foreground">
          Get more customers with featured placement and enhanced promotion.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Featured Deal */}
        <Card className="relative border-blue-200 hover:border-blue-300 transition-colors">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-600 text-white px-4 py-1">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader className="pt-8">
            <CardTitle className="flex items-center justify-between">
              <span>Featured Deal</span>
              <span className="text-2xl font-bold">$39</span>
            </CardTitle>
            <CardDescription>
              Get premium placement and enhanced visibility for 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>Featured placement at top</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Enhanced visibility</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span>Enhanced deal card design</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Featured for 7 days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Headphones className="h-4 w-4 text-blue-600" />
                <span>Priority support</span>
              </div>
            </div>
            <Button 
              onClick={() => handlePromote('featured')}
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            >
              {promotingTo === 'featured' ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Get Featured - $39</span>
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Deal */}
        <Card className="relative border-purple-200 hover:border-purple-300 transition-colors">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-purple-600 text-white px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          <CardHeader className="pt-8">
            <CardTitle className="flex items-center justify-between">
              <span>LaunchBoost Pro</span>
              <span className="text-2xl font-bold">$99</span>
            </CardTitle>
            <CardDescription>
              Everything in Featured plus personal optimization and consultation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="text-xs font-medium text-purple-600 mb-2">Everything in Featured +</div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Personal deal strategy review</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Launch optimization advice</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Fair use protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Extended featured duration</span>
              </div>
            </div>
            <Button 
              onClick={() => handlePromote('pro')}
              disabled={isLoading}
              variant="outline"
              className="w-full mt-6 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              {promotingTo === 'pro' ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Get Pro - $99</span>
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>💳 One-time payment • 🔒 Secure Stripe checkout • 📧 Instant activation</p>
      </div>
    </div>
  )
}