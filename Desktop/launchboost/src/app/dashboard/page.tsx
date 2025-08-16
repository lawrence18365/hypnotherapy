import { getCurrentUser, ensureUserProfile } from "@/lib/server/auth"
import { createServerComponentClient } from "@/lib/server/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuickPromote } from "@/components/deals/quick-promote"
import { 
  TrendingUp, 
  Eye, 
  Gift, 
  MessageSquare, 
  Plus,
  ExternalLink,
  Star,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react"
import Link from "next/link"

// Get real user statistics from database
async function getUserStats(userId: string) {
  const supabase = createServerComponentClient()
  
  // Get total deals submitted by user
  const { data: dealsData, count: totalDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact' })
    .eq('founder_id', userId)
  
  // Get total codes claimed across all user's deals (placeholder - would need codes table)
  const codesClaimed = 0 // TODO: Implement when codes tracking is built
  
  // Get profile views (placeholder - would need views tracking table)  
  const profileViews = 0 // TODO: Implement when analytics is built
  
  // Get followers (placeholder - would need followers table)
  const followers = 0 // TODO: Implement when social features are built
  
  // Get deal status breakdown
  const liveDeals = dealsData?.filter(deal => deal.status === 'live').length || 0
  const pendingDeals = dealsData?.filter(deal => deal.status === 'pending_review').length || 0
  const draftDeals = dealsData?.filter(deal => deal.status === 'draft').length || 0
  const featuredDeals = dealsData?.filter(deal => deal.is_featured).length || 0
  
  return {
    totalDeals: totalDeals || 0,
    codesClaimed,
    profileViews,
    followers,
    liveDeals,
    pendingDeals,
    draftDeals,
    featuredDeals,
    deals: dealsData || []
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf55c' }}>
        <Card className="w-full max-w-md bg-white border-2 border-black rounded-2xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">Access Denied</CardTitle>
            <CardDescription className="text-black/80">Please sign in to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full bg-black hover:bg-neutral-800 text-yellow-400 font-semibold rounded-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure user profile exists and get real stats
  const profile = await ensureUserProfile(user)
  const stats = await getUserStats(user.id)
  
  const userName = profile?.full_name || user.user_metadata?.full_name || user.email || 'User'
  const userFirstName = userName.split(' ')[0]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* BirdDog-Style Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight">
                Welcome back, {userFirstName}!
              </h1>
              <p className="text-lg md:text-xl text-black/80 font-medium">
                Track your deals, connect with early adopters, and grow your SaaS
              </p>
            </div>
            
          </div>

          {/* BirdDog-Style Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-black">Total Deals</CardTitle>
                  <TrendingUp className="h-6 w-6 text-black/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black mb-2">{stats.totalDeals}</div>
                <p className="text-sm text-black/70 font-medium">
                  {stats.totalDeals === 0 ? 'Submit your first deal to get started' : `${stats.liveDeals} live, ${stats.pendingDeals} pending review`}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-black">Featured Deals</CardTitle>
                  <Star className="h-6 w-6 text-black/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black mb-2">{stats.featuredDeals}</div>
                <p className="text-sm text-black/70 font-medium">
                  {stats.featuredDeals === 0 ? 'Boost visibility with featured placement' : 'Premium placement active'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-black">Profile Views</CardTitle>
                  <Eye className="h-6 w-6 text-black/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black mb-2">{stats.profileViews}</div>
                <p className="text-sm text-black/70 font-medium">
                  Coming soon - detailed analytics
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-2 border-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-black">Revenue Potential</CardTitle>
                  <DollarSign className="h-6 w-6 text-black/60" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-black mb-2">${stats.featuredDeals * 99}</div>
                <p className="text-sm text-black/70 font-medium">
                  From featured deal investments
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* BirdDog-Style Getting Started Guide */}
            <Card className="lg:col-span-2 bg-white border-2 border-black rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-black">Getting Started</CardTitle>
                <CardDescription className="text-black/70 font-medium">
                  Launch your first deal and connect with early adopters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center space-x-4 p-6 rounded-2xl border-2 transition-all ${
                    stats.totalDeals > 0 
                      ? 'bg-yellow-50 border-black' 
                      : 'bg-gray-50 border-gray-200 hover:border-black/20 hover:shadow-md'
                  }`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      stats.totalDeals > 0 
                        ? 'bg-black text-yellow-400' 
                        : 'bg-black text-yellow-300'
                    }`}>
                      {stats.totalDeals > 0 ? <CheckCircle className="h-6 w-6" /> : <span className="font-bold text-lg">1</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-black text-lg">
                        {stats.totalDeals > 0 ? 'Deal Submitted!' : 'Submit Your First Deal'}
                      </p>
                      <p className="text-black/70 font-medium">
                        {stats.totalDeals > 0 
                          ? `You have ${stats.totalDeals} deal${stats.totalDeals > 1 ? 's' : ''} submitted`
                          : 'Create an exclusive offer for IndieSaasDeals users'
                        }
                      </p>
                    </div>
                    {stats.totalDeals === 0 && (
                      <Button size="sm" asChild className="bg-black hover:bg-neutral-800 text-yellow-400 font-semibold rounded-full">
                        <Link href="/dashboard/deals/new">Start</Link>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                      <span className="font-bold text-gray-600 text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-600 text-lg">Complete Your Profile</p>
                      <p className="text-gray-500 font-medium">
                        Add your company details and social links
                      </p>
                    </div>
                    <Badge variant="outline" className="border-gray-300 text-gray-600 font-semibold">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                      <span className="font-bold text-gray-600 text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-600 text-lg">Track Analytics</p>
                      <p className="text-gray-500 font-medium">
                        Monitor clicks, conversions, and feedback
                      </p>
                    </div>
                    <Badge variant="outline" className="border-gray-300 text-gray-600 font-semibold">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deal Promotion Panel */}
            <Card className="bg-white border-2 border-black rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="h-6 w-6 text-black" />
                <h3 className="text-xl font-bold text-black">Deal Promotion</h3>
              </div>
              {stats.deals.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-black/70 font-medium">Boost your deal visibility with featured placement</p>
                  <Button className="w-full bg-black hover:bg-neutral-800 text-yellow-400 font-semibold rounded-full">
                    <Star className="mr-2 h-4 w-4" />
                    Feature Deal - $39
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-black/70 font-medium">All your live deals are already promoted! Submit a new deal to get started.</p>
                  <Button asChild className="w-full bg-black hover:bg-neutral-800 text-yellow-400 font-semibold rounded-full">
                    <Link href="/dashboard/deals/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit New Deal
                    </Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>
          
          {/* BirdDog-Style Call to Action */}
          <Card className="bg-white border-2 border-black rounded-2xl shadow-xl p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-black">
                {stats.totalDeals === 0 ? 'Ready to Launch Your First Deal?' : 'Keep the Momentum Going!'}
              </h2>
              <p className="text-xl text-black/70 font-medium max-w-2xl mx-auto">
                {stats.totalDeals === 0 
                  ? 'Join thousands of founders who\'ve connected with early adopters through IndieSaasDeals'
                  : 'You\'re doing great! Consider featuring your deals for maximum visibility'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-black hover:bg-neutral-800 text-yellow-400 font-semibold px-8 py-3 rounded-full shadow-lg">
                  <Link href="/dashboard/deals/new">
                    <Plus className="mr-2 h-5 w-5" />
                    {stats.totalDeals === 0 ? 'Submit Your Deal' : 'Submit Another Deal'}
                  </Link>
                </Button>
                {stats.totalDeals > 0 && (
                  <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 font-semibold px-8 py-3 rounded-full">
                    <Star className="mr-2 h-5 w-5" />
                    Feature Deal ($39)
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
