"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface DealCardProps {
  deal: {
    id: string
    title: string
    short_description: string
    product_name: string
    category: string
    discount_percentage: number
    original_price: number // in cents
    deal_price: number // in cents
    expires_at: string
    slug: string
    icon_url?: string | null
    avg_rating?: number
    review_count?: number
    claimed_count?: number
    total_codes?: number
    is_featured?: boolean
  }
  isLoggedIn?: boolean
}

export function EnhancedDealCard({ deal, isLoggedIn }: DealCardProps) {
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const timeLeft = deal.expires_at ? 
    Math.ceil((new Date(deal.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  const claimedPercentage = deal.claimed_count && deal.total_codes ? 
    Math.round((deal.claimed_count / deal.total_codes) * 100) : 
    0;

  return (
    <Card className={`group relative overflow-hidden bg-white border-2 border-black hover:shadow-2xl transition-all duration-300 h-full ${deal.is_featured ? 'ring-2 ring-[#fbf55c]' : ''}`}>
      {deal.is_featured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-[#fbf55c] text-black font-bold px-2 py-1 text-xs">
            FEATURED
          </Badge>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Product Icon */}
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border-2 border-black flex items-center justify-center flex-shrink-0">
              {deal.icon_url ? (
                <Image
                  src={deal.icon_url}
                  alt={`${deal.product_name} icon`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {deal.product_name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-black mb-1 group-hover:text-gray-800 transition-colors leading-tight">
                {deal.product_name}
              </h3>
              <Badge variant="outline" className="text-xs mb-2">{deal.category}</Badge>
            </div>
          </div>

          {/* Discount Badge */}
          <Badge className="bg-black text-[#fbf55c] font-bold px-3 py-1 flex-shrink-0">
            {deal.discount_percentage}% OFF
          </Badge>
        </div>

        {/* Deal Title */}
        <Link 
          href={isLoggedIn ? `/deals/${deal.slug}` : '/sign-in'}
          className="group"
        >
          <h4 className="font-semibold text-base text-black mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
            {deal.title}
          </h4>
        </Link>

        {/* Description */}
        <p className="text-gray-700 mb-4 text-sm line-clamp-2">{deal.short_description}</p>
        
        {/* Reviews and Stats */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
          {deal.review_count && deal.review_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#fbf55c] text-[#fbf55c]" />
              <span>{deal.avg_rating?.toFixed(1) || '0.0'}</span>
              <span>({deal.review_count})</span>
            </div>
          )}
          {deal.claimed_count && deal.total_codes && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{deal.claimed_count} claimed</span>
            </div>
          )}
          {timeLeft && timeLeft > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="w-3 h-3" />
              <span>{timeLeft}d left</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black">{formatPrice(deal.deal_price)}</span>
            <span className="text-base text-gray-400 line-through">{formatPrice(deal.original_price)}</span>
          </div>
        </div>

        {/* Progress Bar for Claimed Deals */}
        {deal.claimed_count && deal.total_codes && claimedPercentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{claimedPercentage}% claimed</span>
              <span>{deal.total_codes - deal.claimed_count} left</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${claimedPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={isLoggedIn ? `/deals/${deal.slug}` : '/sign-in'}
          className="block w-full bg-black hover:bg-gray-800 text-[#fbf55c] font-bold py-3 px-4 rounded-xl text-center transition-colors duration-200"
        >
          {isLoggedIn ? 'View Deal' : 'Sign In to View'}
        </Link>
      </CardContent>
    </Card>
  );
}