"use client"

import { DealCard } from '@/components/deals/deal-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import Link from 'next/link'

// Deal type for TypeScript
interface Deal {
  id: string | number;
  title?: string;
  company_name?: string;
  logo_url?: string;
  category?: string;
  discount_percentage?: number;
  is_featured?: boolean;
  codes_total?: number;
  codes_claimed?: number;
  product_url?: string;
}

interface FeaturedCarouselProps {
  deals: Deal[]
  user?: any
}

export function FeaturedCarousel({ deals, user }: FeaturedCarouselProps) {
  if (!deals || deals.length === 0) {
    return null
  }

  return (
    <div className="relative" style={{ maxHeight: '35vh' }}>
      {/* Horizontal Carousel */}
      <div className="featured-carousel">
        {deals.map((deal, index) => (
          <div key={deal.id} className="featured-carousel-item">
            <div className="relative">
              {/* Featured Badge */}
              <div className="absolute -top-2 left-3 z-10">
                <Badge className="badge-featured">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              
              {/* Deal Card with Featured Styling */}
              <div className="deal-card-featured">
                <DealCard
                  deal={deal}
                  user={user}
                  showClaimButton={true}
                />
              </div>
              
              {/* Metrics Row (Small, unobtrusive) */}
              {(deal.codes_total || deal.codes_claimed) && (
                <div className="mt-2 flex justify-center space-x-4 text-xs" style={{ color: 'hsl(var(--neutral-500))' }}>
                  {deal.codes_total && (
                    <span>{deal.codes_total} codes</span>
                  )}
                  {deal.codes_claimed && (
                    <span>{deal.codes_claimed} claimed</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show available slots if less than 3 featured deals */}
        {deals.length < 3 && (
          <>
            {Array.from({ length: 3 - deals.length }, (_, i) => (
              <div key={`slot-${i}`} className="featured-carousel-item">
                <div className="deal-card border-2 border-dashed" style={{ borderColor: 'hsl(var(--border))' }}>
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'hsl(var(--neutral-100))' }}>
                      <Star className="h-6 w-6" style={{ color: 'hsl(var(--neutral-400))' }} />
                    </div>
                    <h4 className="font-medium mb-2" style={{ color: 'hsl(var(--neutral-700))' }}>
                      Available
                    </h4>
                    <p className="text-sm mb-4" style={{ color: 'hsl(var(--neutral-500))' }}>
                      Featured placement for your deal
                    </p>
                    <div className="text-lg font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
                      $39
                    </div>
                    <Button size="sm" variant="outline" className="btn-secondary w-full" asChild>
                      <Link href={user ? "/advertise" : "/sign-in"}>
                        Get featured
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Scroll Indicators (Mobile) */}
      <div className="flex justify-center mt-4 space-x-2 md:hidden">
        {deals.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'hsl(var(--neutral-300))' }}
          />
        ))}
      </div>
    </div>
  )
}
