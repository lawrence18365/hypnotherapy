"use client";

import { Suspense, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, TrendingUp, Clock, Users, ThumbsUp, Flame, Star, Timer, Trophy, AlertCircle, Heart, Bell, Filter } from "lucide-react"
import Link from "next/link"
import { BirdDogEmailModal } from "@/components/modals/EmailCaptureModal"
import { getCurrentUser } from "@/lib/client/auth"
import SponsoredDealCard from "@/components/advertising/SponsoredDealCard"
import SponsoredQuickDeal from "@/components/advertising/SponsoredQuickDeal"
import SponsoredBanner from "@/components/advertising/SponsoredBanner"
import AdvertiseSpot from '@/components/advertising/AdvertiseSpot';
import { CategoryAwareHero } from "@/components/category/CategoryHero"

// Sticky Global Deal Bar Component
const StickyDealBar = ({ urgentDeals }) => {
  const [currentDeal, setCurrentDeal] = useState(0)
  
  useEffect(() => {
    if (urgentDeals.length === 0) return
    const interval = setInterval(() => {
      setCurrentDeal(prev => (prev + 1) % urgentDeals.length)
    }, 10000) // Rotate every 10 seconds
    return () => clearInterval(interval)
  }, [urgentDeals.length])
  
  if (urgentDeals.length === 0) return null
  
  const deal = urgentDeals[currentDeal]
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60)) : null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 z-50 animate-pulse">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 text-sm font-bold">
        <Flame className="w-4 h-4 animate-bounce" />
        <span>FLASH DEAL: {deal.title} - {deal.discount_percentage}% OFF</span>
        <Timer className="w-3 h-3" />
        <span>Ends in {timeLeft}h</span>
        <Link href={`/deals/${deal.slug || deal.id}`} className="bg-white text-red-600 px-3 py-1 rounded text-xs hover:bg-gray-100">
          Claim Now →
        </Link>
        <button onClick={() => setCurrentDeal((prev) => (prev + 1) % urgentDeals.length)} className="text-white/80 hover:text-white">
          Next Deal →
        </button>
      </div>
    </div>
  )
}



// Live Deal Ticker Component
const LiveDealTicker = ({ deals, totalSavings }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (deals.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % deals.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [deals.length])

  if (deals.length === 0) return null

}

// Tabbed Navigation Hero Component
const TabbedHero = ({ deals, isLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('trending')
  console.log('Deals in TabbedHero:', deals);
  
  const tabs = [
    { id: 'trending', label: 'Trending Now', icon: TrendingUp },
    { id: 'ending', label: 'Ending Today', icon: Clock },
    { id: 'new', label: 'New Deals', icon: Zap },
    { id: 'discounts', label: 'Biggest Discounts', icon: Trophy }
  ]
  
  const getFilteredDeals = (tabId) => {
    const currentTime = new Date()
    switch(tabId) {
      case 'trending': 
        return deals.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      case 'ending': 
        return deals.filter(d => {
          if (!d.expires_at) return false
          const timeLeft = Math.ceil((new Date(d.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          return timeLeft <= 3 && timeLeft > 0
        }).sort((a, b) => {
          const timeLeftA = Math.ceil((new Date(a.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          const timeLeftB = Math.ceil((new Date(b.expires_at) - currentTime) / (1000 * 60 * 60 * 24))
          return timeLeftA - timeLeftB
        })
      case 'new': 
        return deals.sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))
      case 'discounts': 
        return deals.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      default: 
        return deals
    }
  }
  
  const filteredDeals = getFilteredDeals(activeTab)
  
  return (
    <div className="mb-12">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white border-2 border-black rounded-lg p-1 flex flex-wrap gap-1">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            const tabDeals = getFilteredDeals(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all text-sm ${activeTab === tab.id ? 'bg-black text-yellow-400' : 'text-black hover:bg-gray-100'}`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tabDeals.length > 0 && (
                  <Badge className={`text-xs ml-1 ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700'}`}>
                    {tabDeals.length}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Tab Content - Grid of 6-8 deals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDeals.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500 mb-2">
              {activeTab === 'ending' ? '⏰ No deals ending soon' : 
               activeTab === 'new' ? '🆕 Loading fresh deals...' :
               activeTab === 'discounts' ? '💰 Calculating biggest savings...' :
               ' Loading trending deals...'}
            </div>
            <p className="text-sm text-gray-400">Check back soon for updates!</p>
          </div>
        ) : (
          filteredDeals.slice(0, 8).map(deal => (
            <QuickDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} showVotes={activeTab === 'trending'} />
          ))
        )}
      </div>
      
      {/* Show All Button */}
      {filteredDeals.length > 8 && (
        <div className="text-center mt-6">
          <Link 
            href={activeTab === 'ending' ? '/deals?filter=ending' : 
                  activeTab === 'new' ? '/deals?filter=new' :
                  activeTab === 'discounts' ? '/deals?sort=discount' :
                  '/deals?sort=popular'}
            className="bg-black text-yellow-400 px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            View All {tabs.find(t => t.id === activeTab)?.label} ({filteredDeals.length})
          </Link>
        </div>
      )}
    </div>
  )
}

const FeaturedDealCard = ({ deal, isLoggedIn, showVotes = true }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft && timeLeft <= 3
  
  // Only show real data, no fake numbers
  const realVotes = deal.upvotes || 0
  const realCodesLeft = deal.codes_remaining || null

  return (
    <Card className={`group relative overflow-hidden bg-white border-2 hover:shadow-2xl transition-all duration-300 h-full ${
      isUrgent ? 'border-red-500 animate-pulse' : 'border-black'
    }`}>
      {isUrgent && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs py-1 px-2 text-center font-bold">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          ENDING SOON!
        </div>
      )}
      
      <CardContent className={`p-6 ${isUrgent ? 'pt-8' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <Badge className={`font-bold px-3 py-1 ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
          
          {/* Product Icon */}
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center">
            {deal.logo_url ? (
              <img 
                src={deal.logo_url} 
                alt={`${deal.title} icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
            ) : null}
            <Zap className={`w-6 h-6 text-gray-400 ${deal.product_logo_url ? 'hidden' : 'block'}`} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-black mb-2">{deal.title}</h3>
        <p className="text-gray-700 mb-4 text-sm">{deal.short_description}</p>
        
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-xs">{deal.category}</Badge>
          {deal.review_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{deal.avg_rating}</span>
              <span>({deal.review_count})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black">{formatPrice(deal.deal_price)}</span>
            <span className="text-lg text-gray-400 line-through">{formatPrice(deal.original_price)}</span>
          </div>
          {timeLeft && timeLeft > 0 && (
            <div className={`flex items-center gap-1 text-xs ${
              isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'
            }`}>
              <Clock className={`w-3 h-3 ${isUrgent ? 'animate-pulse' : ''}`} />
              {timeLeft}d left
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 text-xs">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {realCodesLeft} left
            </span>
          ) : (
            <span className="text-gray-500">
              Deal Active
            </span>
          )}
          <span className="text-green-600 font-semibold">
            Save ${(deal.original_price - deal.deal_price).toFixed(0)}
          </span>
        </div>
        
        <Link href={isLoggedIn ? `/deals/${deal.slug || deal.id}` : "/sign-in"} className="block w-full">
          <button className={`w-full font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
            isUrgent 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-black hover:bg-gray-800 text-yellow-400'
          }`}>
            {isUrgent ? 'Claim Now!' : 'Get Deal'} <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </CardContent>
    </Card>
  )
}

const QuickDealCard = ({ deal, isLoggedIn, showVotes = true }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft && timeLeft <= 2
  
  // Only show real data, no fake numbers
  const realVotes = deal.upvotes || 0
  const realCodesLeft = deal.codes_remaining || null

  return (
    <Link href={isLoggedIn ? `/deals/${deal.slug || deal.id}` : "/sign-in"} className="block">
      <div className={`bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer relative ${
        isUrgent ? 'border-red-500 hover:border-red-600' : 'border-black hover:border-gray-800'
      }`}>
        {isUrgent && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            URGENT!
          </div>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-black text-sm line-clamp-1 flex-1 mr-2">{deal.title}</h4>
          
          {/* Product Icon */}
          <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center flex-shrink-0">
            {deal.logo_url ? (
              <img 
                src={deal.logo_url} 
                alt={`${deal.title} icon`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
            ) : null}
            <Zap className={`w-4 h-4 text-gray-400 ${deal.product_logo_url ? 'hidden' : 'block'}`} />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-black">{formatPrice(deal.deal_price)}</span>
            <span className="text-sm text-gray-400 line-through">{formatPrice(deal.original_price)}</span>
          </div>
          <Badge className={`text-xs font-bold ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-black text-yellow-400'
          }`}>
            {deal.discount_percentage}% OFF
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Only show codes left if we have real data */}
          {realCodesLeft ? (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {realCodesLeft} left
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Deal Active
            </span>
          )}
          
          <div className="flex items-center gap-2">
            {deal.review_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{deal.avg_rating}</span>
              </div>
            )}
            <span className="text-xs text-green-600 font-semibold">
              Save ${(deal.original_price - deal.deal_price).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Deal Hunter Stats Component
const DealHunterStats = ({ totalSavings, activeDeals }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-gray-200 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-center gap-8 text-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div>
            <div className="text-lg font-bold text-black">{formatNumber(totalSavings)}</div>
            <div className="text-xs text-gray-600">Total Savings</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-lg font-bold text-black">{activeDeals}</div>
            <div className="text-xs text-gray-600">Active Deals</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-lg font-bold text-black">Live</div>
            <div className="text-xs text-gray-600">Platform Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Category Swim Lane Component
const CategorySwimLane = ({ category, deals, isLoggedIn }) => {
  const categoryDeals = deals.filter(deal => {
    // More precise category matching
    const categoryMatch = deal.category?.toLowerCase() === category.slug.toLowerCase()
    const titleMatch = deal.title?.toLowerCase().includes(category.slug.toLowerCase())
    const descriptionMatch = deal.short_description?.toLowerCase().includes(category.slug.toLowerCase())
    
    return categoryMatch || titleMatch || descriptionMatch
  })
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <category.icon className="w-5 h-5 text-blue-600" />
          {category.name}
          {categoryDeals.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              {categoryDeals.length} deal{categoryDeals.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
        <Link 
          href={`/categories/${category.slug}`} 
          className="text-sm text-black/70 hover:text-black font-medium flex items-center gap-1"
        >
          See All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categoryDeals.length === 0 ? (
          // Show empty state cards when no deals, but ALWAYS show sponsor spot
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <category.icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No deals yet</p>
                </div>
              </div>
            ))}
            <SponsoredQuickDeal position={`${category.name} Sponsor`} />
          </>
        ) : (
          // Show real deals + sponsor spot
          <>
            {categoryDeals.slice(0, 4).map(deal => (
              <QuickDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} showVotes={false} />
            ))}
            <SponsoredQuickDeal position={`${category.name} Sponsor`} />
          </>
        )}
      </div>
    </div>
  )
}

// Personalization Block Component
const PersonalizationBlock = ({ title, deals, isLoggedIn, icon: Icon }) => {
  if (!isLoggedIn || deals.length === 0) return null
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.slice(0, 4).map(deal => (
          <QuickDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} showVotes={false} />
        ))}
      </div>
    </div>
  )
}

export default function DealHunterOptimizedHomepage() {
  const [featuredDeals, setFeaturedDeals] = useState([])
  const [quickDeals, setQuickDeals] = useState([])
  const [allDeals, setAllDeals] = useState([])
  const [urgentDeals, setUrgentDeals] = useState([])
  const [totalSavings, setTotalSavings] = useState(0)
  const [activeDeals, setActiveDeals] = useState(0)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('') // Category detection state
  const [dealFilters, setDealFilters] = useState({
    category: 'all',
    sortBy: 'discount' // discount, expiring, popular
  })
  
  // Categories for swim lanes
  const categories = [
    { name: 'MARKETING TOOLS', slug: 'marketing', icon: TrendingUp },
    { name: 'DEVELOPER TOOLS', slug: 'development', icon: Zap },
    { name: 'AI & AUTOMATION', slug: 'ai', icon: Star },
    { name: 'DESIGN & CREATIVE', slug: 'design', icon: Trophy },
    { name: 'PRODUCTIVITY', slug: 'productivity', icon: Clock }
  ]

  // Category detection effect
  useEffect(() => {
    // Detect category from URL params or referral source
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get('category')
      
      // Detect from referral source
      const referrer = document.referrer
      if (referrer.includes('producthunt') || referrer.includes('marketing')) setCategory('marketing')
      else if (referrer.includes('hackernews') || referrer.includes('github') || referrer.includes('dev')) setCategory('development')
      else if (referrer.includes('ai') || referrer.includes('openai') || referrer.includes('automation')) setCategory('ai')
      else if (referrer.includes('dribbble') || referrer.includes('design') || referrer.includes('figma')) setCategory('design')
      else if (referrer.includes('productivity') || referrer.includes('notion') || referrer.includes('team')) setCategory('productivity')
      
      // URL parameter takes precedence
      if (categoryParam) setCategory(categoryParam)
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setIsLoggedIn(!!currentUser)

        // Fetch ALL deals first
        const allDealsResponse = await fetch('/api/deals?limit=50')
        if (allDealsResponse.ok) {
          const allData = await allDealsResponse.json()
          const deals = allData.deals || []
          
          // Separate deals by pricing tier
          const featuredDealsData = deals.filter(deal => 
            deal.pricing_tier === 'featured' || deal.pricing_tier === 'premium'
          ).slice(0, 3)
          
          const quickDealsData = deals.filter(deal => 
            deal.pricing_tier === 'free'
          ).slice(0, 6)
          
          // If no featured deals, use the first 3 deals regardless of tier
          const finalFeaturedDeals = featuredDealsData.length > 0 
            ? featuredDealsData 
            : deals.slice(0, 3)
            
          // If no free deals, use remaining deals
          const finalQuickDeals = quickDealsData.length > 0 
            ? quickDealsData 
            : deals.slice(3, 9)
          
          // Identify urgent deals (ending within 24 hours)
          const currentTime = new Date()
          const urgent = deals.filter(deal => {
            if (!deal.expires_at) return false
            const timeLeft = (new Date(deal.expires_at) - currentTime) / (1000 * 60 * 60)
            return timeLeft <= 24 && timeLeft > 0
          })
          
          setAllDeals(deals)
          setFeaturedDeals(finalFeaturedDeals)
          setQuickDeals(finalQuickDeals)
          setUrgentDeals(urgent)
          setActiveDeals(deals.length)
          
          // Calculate total savings across all deals
          const savings = deals.reduce((total, deal) => {
            return total + (deal.original_price - deal.deal_price)
          }, 0)
          setTotalSavings(Math.round(savings))
        } else {
          console.error('Failed to fetch deals:', allDealsResponse.status)
        }

      } catch (error) {
        console.error('Error loading homepage data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Helper functions for personalization
  const getPersonalizedDeals = (user, deals) => {
    if (!user || deals.length === 0) return []
    // Simple personalization - return highest rated deals
    return deals.filter(deal => deal.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating)
  }
  
  const getUserWatchlist = (user) => {
    if (!user) return []
    // Mock watchlist - in real app, fetch from API
    return allDeals.slice(0, 2)
  }

  return (
    <>
    {/* Sticky Deal Bar */}
    <StickyDealBar urgentDeals={urgentDeals} />
    
    
    <div className="min-h-screen pt-12" style={{ backgroundColor: '#fbf55c' }}>
      {/* Deal Hunter Optimized Hero Section */}
      <section className="py-8 md:py-12 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Live Deal Ticker */}
          <LiveDealTicker deals={[...featuredDeals, ...quickDeals]} totalSavings={totalSavings} />
          
          {/* Category-Aware Hero */}
          <CategoryAwareHero 
            category={category}
            totalSavings={totalSavings}
            activeDeals={activeDeals}
            isLoggedIn={isLoggedIn}
          />
          
          {/* Tabbed Navigation Hero */}
          <TabbedHero deals={allDeals} isLoggedIn={isLoggedIn} />
          
          {/* Header Banner Ad Spot */}
          <div className="mb-8">
            <SponsoredBanner position="Header Banner" size="medium" />
          </div>

          {/* Top Deals Section - 2 Real Deals + 1 Strategic Sponsor */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500" />
                Top Deals Ending Soon
              </h2>
              <div className="flex items-center gap-2 text-sm text-black/70">
                <Clock className="w-4 h-4" />
                Updated 5 min ago
              </div>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-64">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-300 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredDeals.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Show first 2 REAL deals */}
                {featuredDeals.slice(0, 2).map((deal) => (
                  <FeaturedDealCard key={deal.id} deal={deal} isLoggedIn={isLoggedIn} />
                ))}
                
                {/* One strategic sponsor spot */}
                <SponsoredDealCard position="Premium Sponsor" />
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-black mb-4">Loading Fresh Deals...</h3>
                <p className="text-black/80 mb-6">We're updating the hottest deals for you!</p>
              </div>
            )}
          </div>
        </div>

        {/* Mid-Page Banner Ad Spot */}
        <div className="pb-8 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <SponsoredBanner position="Mid-Page Banner" size="large" />
          </div>
        </div>

        {/* Category Swim Lanes Section */}
        <div className="pb-8 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
                🎨 Browse by Category
              </h2>
              <p className="text-black/80 font-medium">Find deals tailored to your needs</p>
            </div>
            
            {loading ? (
              <div className="space-y-8">
                {categories.map((category, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="bg-white border-2 border-black rounded-lg p-4 h-32">
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => (
                  <CategorySwimLane 
                    key={category.slug} 
                    category={category} 
                    deals={allDeals} 
                    isLoggedIn={isLoggedIn} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        
        
        {/* Bottom Banner Ad Spot */}
        <div className="pb-8 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <SponsoredBanner position="Bottom Banner" size="medium" />
          </div>
        </div>
        
        {/* Enhanced CTAs for Deal Hunters */}
        <div className="pb-16 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-black rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                🏆 Be Among Our First Deal Hunters
              </h3>
              <p className="text-yellow-100 mb-6">
                Join the founding community. Get early access to exclusive deals and help shape the future of SaaS discovery!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href={isLoggedIn ? "/deals" : "/sign-in"}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg font-bold transition-colors duration-200 flex items-center gap-2"
                >
                  <Flame className="w-5 h-5" />
                  {isLoggedIn ? "Browse All Deals" : "Start Deal Hunting"}
                </Link>
                
                <Link
                  href={isLoggedIn ? "/dashboard/deals/new" : "/sign-in"}
                  className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3 rounded-lg font-bold transition-colors duration-200 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {isLoggedIn ? "Submit Your Deal" : "Get VIP Access"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    {/* Email Capture Modal */}
    <BirdDogEmailModal />
    
    
    
    </>
  )
}
