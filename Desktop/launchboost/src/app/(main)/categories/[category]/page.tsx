"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/client/auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Filter, Clock, Users, Star, TrendingUp } from 'lucide-react';

// Category mapping
const categoryMap = {
  'ai-machine-learning': 'AI & Machine Learning',
  'analytics-data': 'Analytics & Data',
  'business-finance': 'Business & Finance',
  'communication-collaboration': 'Communication & Collaboration',
  'design-creative': 'Design & Creative',
  'developer-tools': 'Developer Tools',
  'ecommerce-retail': 'E-commerce & Retail',
  'education-learning': 'Education & Learning',
  'healthcare-wellness': 'Healthcare & Wellness',
  'hr-recruiting': 'HR & Recruiting',
  'marketing-growth': 'Marketing & Growth',
  'productivity-organization': 'Productivity & Organization',
  'sales-crm': 'Sales & CRM',
  'security-privacy': 'Security & Privacy',
  'social-community': 'Social & Community'
};

// --- UI Components ---
const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 h-10 px-4 py-2",
    destructive: "bg-red-600 text-white hover:bg-red-600/90 h-10 px-4 py-2"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ className = '', ...props }) => (
  <input className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const DealCard = ({ deal }) => {
  const formatPrice = (price) => {
    const priceInDollars = price > 999 ? price / 100 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInDollars);
  };

  const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date();
  const timeLeft = deal.expires_at ? Math.ceil((new Date(deal.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-white border-2 border-black rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant={deal.pricing_tier === 'free' ? 'secondary' : 'default'} className="bg-black text-yellow-400 font-bold">
              {deal.pricing_tier === 'free' ? 'Free' : 
               deal.pricing_tier === 'featured' ? 'Featured' : 'Premium'}
            </Badge>
            {isExpired && <Badge variant="destructive">Expired</Badge>}
          </div>
        </div>
        <CardTitle className="text-xl line-clamp-2 text-black">{deal.title}</CardTitle>
        <p className="text-black/80 text-sm line-clamp-3 font-medium">
          {deal.short_description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(deal.deal_price)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(deal.original_price)}
            </span>
            <Badge className="ml-auto bg-green-100 text-green-800 font-bold">
              {deal.discount_percentage}% OFF
            </Badge>
          </div>

          {/* Deal Stats */}
          <div className="flex items-center justify-between text-sm text-black/60">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {deal.codes_remaining || 0} left
            </span>
            {timeLeft !== null && timeLeft > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeLeft} day{timeLeft !== 1 ? '&apos;s&apos;' : '&apos;&apos;'} left
              </span>
            )}
          </div>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-black text-black">
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <Badge variant="outline" className="text-xs border-black text-black">
                  +{deal.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* CTA Button */}
          <Link href={`/deals/${deal.slug || deal.id}`} className="block w-full">
            <Button className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-bold rounded-full">
              {isExpired ? 'View Deal' : 'Get Deal'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CategoryPage({ params }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categorySlug = params.category;
  const categoryName = categoryMap[categorySlug];

  // Category pages should be publicly accessible - no authentication required
  useEffect(() => {
    if (categoryName) {
      fetchCategoryDeals();
    }
  }, [categoryName, sortBy]);

  // Show 404 if category doesn't exist
  if (!categoryName) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffd63' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Category Not Found</h1>
          <p className="text-black/80 font-medium mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/categories" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const fetchCategoryDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deals');
      
      if (response.ok) {
        const data = await response.json();
        // Filter deals by category
        const categoryDeals = (data.deals || []).filter(deal => deal.category === categoryName);
        setDeals(categoryDeals);
      } else {
        console.error('Failed to fetch deals');
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'discount':
        return b.discount_percentage - a.discount_percentage;
      case 'ending':
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at) - new Date(b.expires_at);
      case 'popular':
        return (b.views_count || 0) - (a.views_count || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffd63' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/categories" className="inline-flex items-center text-black/80 hover:text-black font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
              {categoryName}
            </h1>
            <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto leading-relaxed">
              Discover exclusive deals on the best {categoryName.toLowerCase()} tools and platforms. 
              Get early-bird pricing and lifetime offers from innovative SaaS companies.
            </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <option value="newest">Newest First</option>
              <option value="discount">Best Discount</option>
              <option value="ending">Ending Soon</option>
              <option value="popular">Most Popular</option>
            </select>

            <div className="flex items-center gap-2 text-sm text-black/80 font-medium">
              <TrendingUp className="w-4 h-4" />
              {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64 bg-white border-2 border-black rounded-2xl">
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
        ) : sortedDeals.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-black mb-4">
              No deals found in {categoryName}
            </h3>
            <p className="text-black/80 font-medium mb-8">
              Try adjusting your search criteria or check back later for new deals.
            </p>
            <Link href="/categories" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-black mb-4">
              Have a {categoryName} tool to promote?
            </h2>
            <p className="text-black/80 font-medium mb-8">
              Join LaunchBoost and get your {categoryName.toLowerCase()} product in front of thousands of early adopters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/deals/new" 
                className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center justify-center"
              >
                Submit Your Deal
              </Link>
              <Link 
                href="/categories" 
                className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-full border-2 border-black transition-colors duration-200 inline-flex items-center justify-center"
              >
                Browse Other Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
