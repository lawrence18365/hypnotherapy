"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Icons ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// --- UI Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white border-2 border-black rounded-2xl shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-bold text-black leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-black text-yellow-400',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}>{children}</span>;
};

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-full font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black hover:bg-gray-800 text-yellow-400",
    outline: "border-2 border-black bg-white hover:bg-black hover:text-yellow-400 text-black",
    destructive: "bg-red-600 hover:bg-red-700 text-white"
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-12 px-6 py-3 text-base"
  };
  
  if (props.href) {
    return <Link href={props.href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>{children}</Link>;
  }
  
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

export default function ApprovedDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLive: 0,
    totalRevenue: 0,
    totalViews: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchApprovedDeals();
  }, []);

  const fetchApprovedDeals = async () => {
    try {
      setLoading(true);
      console.log('Fetching approved deals...');
      
      // Fetch live deals
      const response = await fetch('/api/deals?limit=100');
      const data = await response.json();
      
      const liveDeals = data.deals || [];
      console.log('Live deals:', liveDeals);
      
      // Calculate stats
      const totalViews = liveDeals.reduce((sum, deal) => sum + (deal.views_count || 0), 0);
      const totalRevenue = liveDeals.reduce((sum, deal) => {
        if (deal.pricing_tier === 'premium') return sum + 39.99;
        if (deal.pricing_tier === 'featured') return sum + 19.99;
        return sum;
      }, 0);
      
      // Calculate average rating (from reviews if available)
      const dealsWithRatings = liveDeals.filter(deal => deal.avg_rating > 0);
      const averageRating = dealsWithRatings.length > 0 
        ? dealsWithRatings.reduce((sum, deal) => sum + deal.avg_rating, 0) / dealsWithRatings.length
        : 0;
      
      setStats({
        totalLive: liveDeals.length,
        totalRevenue,
        totalViews,
        averageRating: Number(averageRating.toFixed(1))
      });
      
      setDeals(liveDeals);
      
    } catch (error) {
      console.error('Error fetching approved deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return 'No expiration';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Live Deals</h1>
          <p className="text-black/80 font-medium mt-2">
            Monitor and manage currently active deals on the platform
          </p>
        </div>
        <Button href="/admin" variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Live Deals</CardTitle>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.totalLive}</div>
            <p className="text-xs text-black/70 font-medium mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Revenue</CardTitle>
              <DollarSignIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-black/70 font-medium mt-1">From featured deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Total Views</CardTitle>
              <EyeIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-black/70 font-medium mt-1">Across all deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Avg Rating</CardTitle>
              <span className="text-yellow-500">⭐</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.averageRating || 'N/A'}</div>
            <p className="text-xs text-black/70 font-medium mt-1">User satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deals ({deals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-black mb-2">No Live Deals</h3>
              <p className="text-black/70 font-medium">All approved deals will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-black/10">
                    <th className="text-left py-3 px-4 font-bold text-black">Deal</th>
                    <th className="text-left py-3 px-4 font-bold text-black">Founder</th>
                    <th className="text-left py-3 px-4 font-bold text-black">Pricing</th>
                    <th className="text-left py-3 px-4 font-bold text-black">Performance</th>
                    <th className="text-left py-3 px-4 font-bold text-black">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b border-black/5 hover:bg-yellow-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-bold text-black text-sm">{deal.title}</div>
                          <div className="text-xs text-black/70 font-medium">{deal.category}</div>
                          <div className="text-xs text-black/50 mt-1">Created {formatDate(deal.created_at)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-black">
                          {deal.profiles?.full_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={deal.pricing_tier === 'premium' ? 'warning' : deal.pricing_tier === 'featured' ? 'info' : 'default'}>
                            {deal.pricing_tier}
                          </Badge>
                          <div className="text-sm font-bold text-black">
                            {formatCurrency(deal.deal_price)} 
                            <span className="text-xs text-black/70 line-through ml-1">
                              {formatCurrency(deal.original_price)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-3 w-3" />
                            <span className="font-medium">{deal.views_count || 0} views</span>
                          </div>
                          {deal.avg_rating > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-medium">{deal.avg_rating} ({deal.review_count || 0})</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Badge variant="success">Live</Badge>
                          <div className="text-xs font-medium text-black/70">
                            {getDaysRemaining(deal.expires_at)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button href={`/deals/${deal.slug}`} variant="outline" size="sm">
                            <ExternalLinkIcon className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
