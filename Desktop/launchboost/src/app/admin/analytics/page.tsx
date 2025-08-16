"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Icons ---
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline><polyline points="16,7 22,7 22,13"></polyline></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon></svg>;

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

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-full font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black hover:bg-gray-800 text-yellow-400 h-10 px-4 py-2 text-sm",
    outline: "border-2 border-black bg-white hover:bg-black hover:text-yellow-400 text-black h-10 px-4 py-2 text-sm"
  };
  
  if (props.href) {
    return <Link href={props.href} className={`${base} ${variants[variant]} ${className}`}>{children}</Link>;
  }
  
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalDeals: 0,
    liveDeals: 0,
    pendingDeals: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalFounders: 0,
    averageRating: 0,
    conversionRate: 0,
    topCategories: [],
    recentActivity: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      
      // Fetch all necessary data
      const [liveDealsRes, pendingDealsRes] = await Promise.all([
        fetch('/api/deals?limit=1000'),
        fetch('/api/admin/deals/pending')
      ]);
      
      const liveData = await liveDealsRes.json();
      const pendingData = await pendingDealsRes.json();
      
      const liveDeals = liveData.deals || [];
      const pendingDeals = pendingData.deals || [];
      const allDeals = [...liveDeals, ...pendingDeals];
      
      console.log('Analytics data:', { live: liveDeals.length, pending: pendingDeals.length });
      
      // Calculate revenue
      const revenue = liveDeals.reduce((sum, deal) => {
        if (deal.pricing_tier === 'premium') return sum + 39.99;
        if (deal.pricing_tier === 'featured') return sum + 19.99;
        return sum;
      }, 0);
      
      // Calculate total views
      const totalViews = liveDeals.reduce((sum, deal) => sum + (deal.views_count || 0), 0);
      
      // Get unique founders
      const uniqueFounders = new Set(allDeals.map(deal => deal.founder_id)).size;
      
      // Calculate average rating
      const dealsWithRatings = liveDeals.filter(deal => deal.avg_rating > 0);
      const averageRating = dealsWithRatings.length > 0 
        ? dealsWithRatings.reduce((sum, deal) => sum + deal.avg_rating, 0) / dealsWithRatings.length
        : 0;
      
      // Calculate conversion rate (rough estimate: featured deals / total deals)
      const featuredDeals = liveDeals.filter(deal => deal.pricing_tier !== 'free').length;
      const conversionRate = allDeals.length > 0 ? (featuredDeals / allDeals.length) * 100 : 0;
      
      // Top categories
      const categoryCount = {};
      allDeals.forEach(deal => {
        categoryCount[deal.category] = (categoryCount[deal.category] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));
      
      // Recent activity (last 5 deals)
      const recentActivity = liveDeals
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(deal => ({
          id: deal.id,
          title: deal.title,
          action: 'Deal went live',
          date: deal.created_at,
          category: deal.category
        }));
      
      setAnalytics({
        totalDeals: allDeals.length,
        liveDeals: liveDeals.length,
        pendingDeals: pendingDeals.length,
        totalRevenue: revenue,
        totalViews,
        totalFounders: uniqueFounders,
        averageRating: Number(averageRating.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(1)),
        topCategories,
        recentActivity,
        monthlyStats: [] // Could be calculated from created_at dates
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold text-black">Analytics Dashboard</h1>
          <p className="text-black/80 font-medium mt-2">
            Track platform performance and business metrics
          </p>
        </div>
        <Button href="/admin" variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Total Revenue</CardTitle>
              <DollarSignIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-black/70 font-medium mt-1">From listing fees</p>
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
            <div className="text-3xl font-bold text-black">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-black/70 font-medium mt-1">Across all deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Active Founders</CardTitle>
              <UsersIcon className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{analytics.totalFounders}</div>
            <p className="text-xs text-black/70 font-medium mt-1">Unique contributors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Conversion Rate</CardTitle>
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{analytics.conversionRate}%</div>
            <p className="text-xs text-black/70 font-medium mt-1">To paid listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">Deal Status</CardTitle>
              <BarChartIcon className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Live Deals</span>
                <Badge variant="success">{analytics.liveDeals}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Pending Review</span>
                <Badge variant="warning">{analytics.pendingDeals}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Total Submitted</span>
                <Badge variant="info">{analytics.totalDeals}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-black">User Satisfaction</CardTitle>
              <StarIcon className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">
                {analytics.averageRating || 'N/A'}
              </div>
              <div className="text-yellow-500 text-xl mb-2">
                {'⭐'.repeat(Math.floor(analytics.averageRating || 0))}
              </div>
              <p className="text-xs text-black/70 font-medium">Average rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-black">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Active Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {analytics.totalDeals > 0 ? Math.round((analytics.liveDeals / analytics.totalDeals) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Avg Views/Deal</span>
                <span className="text-sm font-bold text-black">
                  {analytics.liveDeals > 0 ? Math.round(analytics.totalViews / analytics.liveDeals) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Revenue/Deal</span>
                <span className="text-sm font-bold text-black">
                  {analytics.liveDeals > 0 ? formatCurrency(analytics.totalRevenue / analytics.liveDeals) : '$0.00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-black/70 font-medium">No category data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black text-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-black">{item.category}</span>
                    </div>
                    <Badge variant="info">{item.count} deals</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🕐</div>
                <p className="text-black/70 font-medium">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-black/70 font-medium">
                        {activity.action} • {activity.category}
                      </p>
                      <p className="text-xs text-black/50 mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button href="/admin/deals/pending" className="justify-start">
              Review Pending Deals ({analytics.pendingDeals})
            </Button>
            <Button href="/admin/deals/approved" variant="outline" className="justify-start">
              Manage Live Deals ({analytics.liveDeals})
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="justify-start"
            >
              Refresh Analytics Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
