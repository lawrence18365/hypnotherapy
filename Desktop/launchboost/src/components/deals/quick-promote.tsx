"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, TrendingUp, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'

// Define a placeholder type for Deal if the actual type isn't available here.
// In a real scenario, you would import this from '@/lib/types'
interface Deal {
  id: string | number;
  status: 'live' | 'draft' | 'expired';
  pricing_tier: 'free' | 'premium';
  product_name: string;
  codes_claimed?: number;
  codes_total?: number;
}

interface QuickPromoteProps {
  deals: Deal[]
}

export function QuickPromote({ deals }: QuickPromoteProps) {
  const unpromoted = deals.filter(deal => 
    deal.status === 'live' && deal.pricing_tier === 'free'
  )

  if (unpromoted.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Deal Promotion</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            All your live deals are already promoted! Submit a new deal to get started.
          </p>
          <Button asChild>
            <Link href="/dashboard/deals/new">
              <Zap className="h-4 w-4 mr-2" />
              Submit New Deal
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Boost Your Deals</span>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            {unpromoted.length} eligible
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Get 10x more visibility with featured placement at the top of our homepage.
        </p>
        
        {unpromoted.slice(0, 3).map((deal) => (
          <div key={deal.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{deal.product_name}</h4>
              <p className="text-sm text-muted-foreground">
                {deal.codes_claimed || 0} / {deal.codes_total || 0} codes claimed
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/deals/${deal.id}`}>
                  View
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/dashboard/deals/${deal.id}#promotion`}>
                  <Star className="h-3 w-3 mr-1" />
                  Promote
                </Link>
              </Button>
            </div>
          </div>
        ))}
        
        {unpromoted.length > 3 && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/deals">
              View All {unpromoted.length} Deals
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-600">$39</span>
              </div>
              <p className="text-xs text-muted-foreground">Featured Deal<br/>7 days placement</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-1">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-600">$99</span>
              </div>
              <p className="text-xs text-muted-foreground">LaunchBoost Pro<br/>14 days + consultation</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
