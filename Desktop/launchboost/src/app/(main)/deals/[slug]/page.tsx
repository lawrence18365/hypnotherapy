"use client";

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/client/auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Clock, Users, Star, Tag, Calendar, Zap, Shield, CheckCircle, Info, Flame, Trophy, Timer, AlertCircle, ThumbsUp } from 'lucide-react';

// --- UI Components ---
const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black text-yellow-400 hover:bg-gray-800 h-12 px-6 py-3",
    outline: "border-2 border-black bg-white hover:bg-gray-100 h-12 px-6 py-3 text-black",
    urgent: "bg-red-600 text-white hover:bg-red-700 h-12 px-6 py-3",
    primary: "bg-black text-yellow-400 hover:bg-gray-800 h-14 px-8 py-4 text-lg"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export default function DealPage({ params }) {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [votes, setVotes] = useState(15);
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();

  // Remove authentication requirement - deal pages should be accessible to everyone
  useEffect(() => {
    setAuthLoading(false)
  }, [])

  // Fetch deal data
  useEffect(() => {
    fetchDeal()
  }, [params.slug])

  const fetchDeal = async () => {
    try {
      setLoading(true);
      
      // For now, handle both ID and slug formats
      const identifier = params.slug;
      let response;
      
      // Try to fetch by slug first, then by ID
      response = await fetch(`/api/deals/${identifier}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch deal');
      }
      
      const data = await response.json();
      setDeal(data.deal);
      setVotes(data.deal.upvotes || Math.floor(Math.random() * 50) + 10);
    } catch (err) {
      console.error('Error fetching deal:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf55c' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  const handleClaimDeal = async () => {
    // Check if user is authenticated before claiming
    const user = await getCurrentUser()
    if (!user) {
      router.push('/sign-in')
      return
    }
    
    setClaiming(true);
    try {
      const response = await fetch(`/api/deals/${params.slug}/claim`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Deal claimed successfully! Check your email for the code.');
        fetchDeal(); // Refresh deal data
      } else {
        alert(result.error || 'Failed to claim deal');
      }
    } catch (error) {
      console.error('Error claiming deal:', error);
      alert('Failed to claim deal. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleVote = (e) => {
    e.preventDefault()
    if (!hasVoted) {
      setVotes(prev => prev + 1)
      setHasVoted(true)
    }
  }

  const formatPrice = (price) => {
    // Handle both cents and dollar formats
    const priceInDollars = price > 999 ? price / 100 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            {/* Navigation Loading */}
            <div className="h-10 w-32 bg-black/20 rounded-lg"></div>
            
            {/* Hero Loading */}
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-8 w-48 bg-black/20 rounded-lg"></div>
                <div className="h-16 bg-black/20 rounded-lg"></div>
                <div className="h-32 bg-white/80 border-2 border-black rounded-lg"></div>
              </div>
              <div className="h-96 bg-white/80 border-2 border-black rounded-lg"></div>
            </div>
            
            {/* Content Loading */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-white/80 border-2 border-black rounded-lg"></div>
              <div className="h-96 bg-white/80 border-2 border-black rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf55c' }}>
        <div className="max-w-md mx-auto text-center px-6">
          <div className="bg-white border-2 border-black rounded-lg p-8">
            <div className="w-16 h-16 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-4">🔍 Deal Not Found</h1>
            <p className="text-black/80 mb-8 leading-relaxed">{error}</p>
            <Link 
              href="/deals" 
              className="inline-flex items-center bg-black text-yellow-400 font-bold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    notFound();
  }

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const canClaim = deal.status === 'live' && !isExpired && deal.codes_remaining > 0;
  const discountAmount = deal.original_price - deal.deal_price;
  const savings = Math.round((discountAmount / deal.original_price) * 100);
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = timeLeft && timeLeft <= 3;
  const codesLeft = deal.codes_remaining || Math.floor(Math.random() * 100) + 5;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      {/* Navigation */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/deals" 
            className="inline-flex items-center text-black hover:text-black/80 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ← Back to All Deals
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`font-bold px-4 py-2 text-lg ${isUrgent ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-yellow-400'}`}>
                  {savings}% OFF
                </Badge>
                <Badge className="bg-white border-2 border-black text-black font-bold px-3 py-1">
                  {deal.category}
                </Badge>
                {isExpired && (
                  <Badge className="bg-red-600 text-white font-bold px-3 py-1">
                    EXPIRED
                  </Badge>
                )}
                {isUrgent && (
                  <Badge className="bg-red-600 text-white font-bold px-3 py-1 animate-pulse">
                    <Timer className="w-3 h-3 mr-1" />
                    ENDING SOON!
                  </Badge>
                )}
              </div>
              
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight">
                  {deal.title}
                </h1>
                <p className="text-xl text-black/80 leading-relaxed font-medium">
                  {deal.short_description}
                </p>
              </div>
              
              {/* Pricing Card - LaunchBoost Style */}
              <div className="bg-white border-2 border-black rounded-lg p-8">
                <div className="flex items-baseline gap-4 mb-4">
                  <div className="text-4xl lg:text-5xl font-bold text-black">
                    {formatPrice(deal.deal_price)}
                  </div>
                  <div className="text-2xl text-black/50 line-through">
                    {formatPrice(deal.original_price)}
                  </div>
                </div>
                <div className="bg-black text-yellow-400 font-bold px-3 py-2 rounded inline-block mb-4">
                  💰 Save {formatPrice(discountAmount)}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-4">
                {canClaim ? (
                  <Button 
                    onClick={handleClaimDeal}
                    disabled={claiming}
                    variant={isUrgent ? "urgent" : "primary"}
                    className="w-full sm:w-auto"
                  >
                    {claiming ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Claiming Deal...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Flame className="w-6 h-6" />
                        {isUrgent ? '🔥 CLAIM NOW!' : 'Get This Deal'}
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button disabled className="w-full sm:w-auto bg-gray-400 text-white">
                    {isExpired ? '⏰ Deal Expired' : 
                     deal.codes_remaining === 0 ? '🔥 Sold Out' : 
                     '❌ Unavailable'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full sm:w-auto ml-0 sm:ml-4"
                  onClick={() => window.open(deal.product_website, '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Website
                </Button>
              </div>
              
              {/* Community Stats */}
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-black">{codesLeft}</div>
                    <div className="text-sm text-black/70 font-medium">Codes Left</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">{votes}</div>
                    <div className="text-sm text-black/70 font-medium">Community Votes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-black">{timeLeft || '∞'}</div>
                    <div className="text-sm text-black/70 font-medium">{timeLeft ? 'Days Left' : 'No Expiry'}</div>
                  </div>
                </div>
                
                {/* Vote Button */}
                <button
                  onClick={handleVote}
                  disabled={hasVoted}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-colors ${
                    hasVoted 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-black text-yellow-400 hover:bg-gray-800'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {hasVoted ? '✅ Voted!' : '👍 Vote for this deal'}
                </button>
              </div>
            </div>
            
            {/* Right Column - Product Visual */}
            <div className="relative">
              <div className="bg-white border-2 border-black rounded-lg p-12 aspect-square flex items-center justify-center">
                {deal.product_logo_url ? (
                  <img 
                    src={deal.product_logo_url} 
                    alt={deal.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <Zap className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto text-green-600 mb-2" />
                  <div className="font-bold text-black text-sm">Secure</div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <div className="font-bold text-black text-sm">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Description */}
              <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                <CardHeader className="border-b-2 border-black">
                  <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    About {deal.product_name || deal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-black/80 text-lg font-medium">{deal.description}</p>
                  </div>
                  
                  {deal.tags && deal.tags.length > 0 && (
                    <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                      <h4 className="font-bold text-lg mb-4 text-black">🏷️ Features & Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag, index) => (
                          <Badge key={index} className="bg-white border-2 border-black text-black font-bold px-3 py-1 hover:bg-yellow-100 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Deal Information */}
              <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                <CardHeader className="border-b-2 border-black">
                  <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Deal Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-black font-bold">Available Codes</span>
                      <span className="font-bold text-black">{codesLeft}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 border border-black">
                      <div 
                        className="bg-black h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(10, Math.min(100, (codesLeft / 100) * 100))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-black/70 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Expires
                      </span>
                      <span className="font-bold text-black">
                        {deal.expires_at ? formatDate(deal.expires_at) : 'Never'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-black/70 font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Type
                      </span>
                      <span className="font-bold text-black capitalize">{deal.deal_type || 'Discount'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-black/70 font-medium">Tier</span>
                      <Badge className={`font-bold ${
                        deal.pricing_tier === 'free' ? 'bg-gray-100 text-gray-800 border border-gray-300' : 
                        deal.pricing_tier === 'featured' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                        'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}>
                        {deal.pricing_tier === 'free' ? 'Free' : 
                         deal.pricing_tier === 'featured' ? '⭐ Featured' : '👑 Premium'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Founder */}
              {deal.founder && (
                <Card className="bg-white border-2 border-black hover:shadow-lg transition-shadow">
                  <CardHeader className="border-b-2 border-black">
                    <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      👋 Meet the Founder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black border-2 border-black rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-yellow-400">
                            {(deal.founder.full_name || 'F').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-black text-lg">{deal.founder.full_name || 'Founder'}</h3>
                          {deal.founder.company_name && (
                            <p className="text-black/70 font-medium">{deal.founder.company_name}</p>
                          )}
                        </div>
                      </div>
                      {deal.founder.bio && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                          <p className="text-black/80 leading-relaxed font-medium">{deal.founder.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}