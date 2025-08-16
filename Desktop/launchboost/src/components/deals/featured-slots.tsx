"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ArrowRight, Rocket } from 'lucide-react'
import Link from 'next/link'
import { DealCard } from '@/components/deals/deal-card'

// Keep your existing interfaces
interface Deal {
  id: string | number;
  title?: string;
}

interface FeaturedSlotsProps {
  featuredDeals: Deal[]
  user?: any
}

// This is the main component function
export function FeaturedSlots({ featuredDeals, user }: FeaturedSlotsProps) {
  // Logic for when there ARE featured deals remains the same
  if (featuredDeals && featuredDeals.length > 0) {
    return (
      <div className="mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-xs font-medium mb-4">
            <Star className="h-3 w-3" />
            <span>Featured</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-3 text-balance text-slate-900">
            Featured Deals
          </h1>
          <p className="text-base text-slate-600 mb-8 max-w-2xl mx-auto text-balance">
            Curated deals from founders who chose premium placement.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {featuredDeals.slice(0, 6).map((deal) => (
            <div key={deal.id} className="relative h-full">
              <div className="absolute -top-2 left-3 z-10">
                <Badge className="bg-slate-900 text-white px-2 py-1 text-xs font-medium">
                  Featured
                </Badge>
              </div>
              {/* Ensure your DealCard uses flex flex-col for uniform height */}
              <DealCard
                deal={deal}
                user={user}
                showClaimButton={true}
              />
            </div>
          ))}
        
          {/* Show remaining slots if less than 3 featured deals */}
          {featuredDeals.length < 3 && (
            Array.from({ length: 3 - featuredDeals.length }, (_, i) => (
              <RedesignedAdvertiserSlot key={i} user={user} />
            ))
          )}
        </div>
      </div>
    )
  }

  // If no featured deals, show the new "Advertise Here" slots
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-blue-200">
          <Star className="h-4 w-4 text-blue-500" />
          <span>Get Featured</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-balance text-slate-900">
          Feature Your Deal
        </h1>
        <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto text-balance">
          Get premium placement and put your project in front of thousands of potential customers.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((slot) => (
          <RedesignedAdvertiserSlot key={slot} user={user} />
        ))}
      </div>
    </div>
  )
}


// A new, separate component for the redesigned advertiser slot
// This makes the code cleaner and reusable.
function RedesignedAdvertiserSlot({ user }: { user?: any }) {
  return (
    <Card className="relative flex flex-col overflow-hidden rounded-xl shadow-sm border border-slate-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      {/* Premium Badge */}
      <Badge variant="default" className="absolute top-4 right-4 bg-blue-600 text-white border-2 border-white shadow-md">
        Premium
      </Badge>

      {/* Image Placeholder */}
      <div className="h-40 bg-slate-800 flex flex-col items-center justify-center text-center p-4">
        <Rocket className="h-10 w-10 text-slate-500 mb-3" />
        <h3 className="font-bold text-lg text-white">Your Deal Here</h3>
        <p className="text-sm text-slate-400">Capture everyone's attention</p>
      </div>

      {/* Text Content Area - this part grows */}
      <CardHeader className="flex-grow p-6">
        <CardTitle className="text-lg font-bold text-slate-900 mb-2">
          Feature Your Product
        </CardTitle>
        <p className="text-sm text-slate-600 leading-relaxed">
          Place your deal in this premium spot for maximum visibility and clicks.
        </p>
      </CardHeader>
      
      {/* CTA Button and Price - pushed to the bottom */}
      <CardContent className="p-6 pt-0 flex items-center justify-between">
        <div className="text-2xl font-extrabold text-slate-800">$39</div>
        <Button size="md" className="font-semibold bg-blue-600 hover:bg-blue-700" asChild>
          <Link href={user ? "/dashboard/deals/new" : "/sign-in"}>
            Claim Spot
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Make sure to export the main component
export default FeaturedSlots;
