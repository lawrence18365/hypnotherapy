import { Suspense } from "react"
import { createServerComponentClient } from "@/lib/server/db"
import { requireFounder } from "@/lib/server/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DealPromotion } from "@/components/deals/deal-promotion"
import { TrendingUp, Users, ExternalLink, Star, Clock, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface DealDetailsPageProps {
  params: {
    id: string
  }
}

async function getDealDetails(dealId: string, founderId: string) {
  const supabase = createServerComponentClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      deal_codes(
        id,
        is_claimed,
        claimed_at
      ),
      deal_reviews(
        id,
        rating,
        review_text,
        created_at
      )
    `)
    .eq('id', dealId)
    .eq('founder_id', founderId)
    .single()

  if (error || !deal) {
    return null
  }

  // Calculate analytics
  const totalCodes = deal.deal_codes?.length || 0
  const claimedCodes = deal.deal_codes?.filter((code: any) => code.is_claimed)?.length || 0
  const averageRating = deal.deal_reviews?.length 
    ? deal.deal_reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / deal.deal_reviews.length 
    : 0

  return {
    ...deal,
    analytics: {
      totalCodes,
      claimedCodes,
      remainingCodes: totalCodes - claimedCodes,
      claimRate: totalCodes > 0 ? (claimedCodes / totalCodes) * 100 : 0,
      averageRating,
      reviewCount: deal.deal_reviews?.length || 0
    }
  }
}

export default async function DealDetailsPage({ params }: DealDetailsPageProps) {
  const user = await requireFounder()
  const deal = await getDealDetails(params.id, user.id)

  if (!deal) {
    notFound()
  }

  const featuredUntil = deal.featured_until ? new Date(deal.featured_until) : null
  const isStillFeatured = featuredUntil && featuredUntil > new Date()

  return (
    <div className="container-premium py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{deal.product_name}</h1>
              {deal.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge variant="outline">
                {deal.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-large">{deal.short_description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href={`/deals/${deal.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/deals/${deal.id}/edit`}>
                Edit Deal
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Codes Claimed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deal.analytics.claimedCodes}</div>
              <p className="text-xs text-muted-foreground">
                {deal.analytics.claimRate.toFixed(1)}% claim rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Remaining Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deal.analytics.remainingCodes}</div>
              <p className="text-xs text-muted-foreground">
                of {deal.analytics.totalCodes} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-600" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deal.analytics.averageRating > 0 ? deal.analytics.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {deal.analytics.reviewCount} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deal.views_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                total page views
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="promotion" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Promotion Tab */}
          <TabsContent value="promotion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Boost Your Deal's Performance</CardTitle>
                <p className="text-muted-foreground">
                  Increase visibility and get more customers with our promotion options.
                </p>
              </CardHeader>
              <CardContent>
                <DealPromotion deal={deal} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Codes Claimed</span>
                      <span className="font-medium">{deal.analytics.claimedCodes}/{deal.analytics.totalCodes}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${deal.analytics.claimRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Page Views</span>
                      <span className="font-medium">{deal.views_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Click-through Rate</span>
                      <span className="font-medium">
                        {deal.views_count > 0 ? ((deal.analytics.claimedCodes / deal.views_count) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Rating</span>
                      <span className="font-medium">
                        {deal.analytics.averageRating > 0 ? `${deal.analytics.averageRating.toFixed(1)}/5` : 'No ratings'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Tier</span>
                      <Badge variant={deal.pricing_tier === 'pro' ? 'default' : deal.pricing_tier === 'featured' ? 'secondary' : 'outline'}>
                        {deal.pricing_tier}
                      </Badge>
                    </div>
                    
                    {deal.is_featured && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Featured Until</span>
                        <span className="font-medium text-sm">
                          {featuredUntil ? featuredUntil.toLocaleDateString() : 'Indefinite'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deal Status</span>
                      <Badge variant={deal.status === 'live' ? 'default' : 'secondary'}>
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Reviews</CardTitle>
                  <Button variant="outline" asChild>
                    <Link href={`/feedback/${deal.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Public Reviews
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {deal.deal_reviews && deal.deal_reviews.length > 0 ? (
                  <div className="space-y-4">
                    {deal.deal_reviews.slice(0, 5).map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                        )}
                      </div>
                    ))}
                    
                    {deal.deal_reviews.length > 5 && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/feedback/${deal.id}`}>
                          View All {deal.deal_reviews.length} Reviews
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Customer reviews will appear here once people start using your deal.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href={`/feedback/${deal.id}`}>
                        View Review Page
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}