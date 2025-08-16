import { Deal } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPercentage, getCategoryIcon } from "@/lib/utils"
import { Clock, ExternalLink, Star, Users, MessageSquare } from "lucide-react"
import Link from "next/link"
import { DealClaimButton } from "./deal-claim-button"
import { StarRatingDisplay } from "@/components/ui/star-rating"

interface DealCardProps {
  deal: Deal
  user?: any
  showClaimButton?: boolean
}

export function DealCard({ deal, user, showClaimButton = true }: DealCardProps) {
  const codesRemaining = (deal.codes_total || 0) - (deal.codes_claimed || 0)
  const progressPercentage = deal.codes_total 
    ? ((deal.codes_claimed || 0) / deal.codes_total) * 100 
    : 0

  return (
    <Card className={`${deal.is_featured ? 'deal-card-featured' : 'deal-card-premium'} animate-fade-in`}>
      {deal.is_featured && (
        <div className="badge-featured absolute -top-2 left-4 px-4 py-1 text-xs flex items-center space-x-2 shadow-sm">
          <Star className="h-3 w-3" />
          <span>Featured Deal</span>
        </div>
      )}
      
      <CardHeader className={`pb-4 ${deal.is_featured ? 'pt-8' : 'pt-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {deal.product_logo_url ? (
              <img
                src={deal.product_logo_url}
                alt={`${deal.product_name} logo`}
                className="h-14 w-14 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">
                  {deal.product_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl leading-tight text-foreground mb-1">
                {deal.product_name}
              </h3>
              <p className="text-muted-foreground line-clamp-2">
                {deal.tagline}
              </p>
            </div>
          </div>
          <Badge className="badge-premium bg-accent text-accent-foreground ml-2 shrink-0">
            {deal.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {deal.description}
        </p>

        {/* Reviews Section */}
        {(deal.avg_rating > 0 || deal.review_count > 0) && (
          <div className="flex items-center justify-between mb-4">
            <StarRatingDisplay
              rating={deal.avg_rating || 0}
              reviewCount={deal.review_count || 0}
              size="sm"
            />
            {deal.id && (
              <Link href={`/feedback/${deal.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  View Reviews
                </Button>
              </Link>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Discount Badge */}
          <div className="flex items-center justify-between">
            <div className="badge-success px-4 py-2 text-sm font-bold">
              {formatPercentage(deal.discount_percentage)} OFF
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span className="font-medium">{deal.codes_claimed || 0} claimed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground font-medium">
              <span>{codesRemaining} codes remaining</span>
              <span>{progressPercentage.toFixed(0)}% claimed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0 gap-3">
        {deal.product_url ? (
          <Button variant="outline" className="btn-ghost flex-1" asChild>
            <Link href={deal.product_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Site
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="btn-ghost flex-1" disabled>
            <ExternalLink className="h-4 w-4 mr-2" />
            No Link
          </Button>
        )}

        <div className="flex space-x-2">
          {deal.id ? (
            <Button variant="ghost" className="btn-ghost" asChild>
              <Link href={`/deals/${deal.id}`}>
                Details
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" className="btn-ghost" disabled>
              Details
            </Button>
          )}
          
          {showClaimButton && codesRemaining > 0 && (
            <DealClaimButton deal={deal} user={user} />
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
