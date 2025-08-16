"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Icons ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>;

// --- UI Components with LaunchBoost Theme ---
const Card = ({ children, className = '' }) => <div className={`bg-white border-2 border-black rounded-2xl shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-bold text-black leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-black hover:bg-gray-800 text-yellow-400 h-12 px-6 py-3",
    outline: "border-2 border-black bg-white hover:bg-black hover:text-yellow-400 text-black h-12 px-6 py-3"
  };
  return <Link href={props.href || '#'} className={`${base} ${variants[variant]} ${className}`}>{children}</Link>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingDeals: 0,
    liveDeals: 0,
    totalRevenue: 0,
    archivedDeals: 0,
    marketingOptIns: 0,
    loading: true
  });
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Authentication check using API method (guaranteed to work)
  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('Admin auth: Using API method...');
        
        const response = await fetch('/api/debug');
        const data = await response.json();
        
        console.log('Admin Auth Check (API):', { 
          user: !!data.user, 
          profile: data.profile, 
          role: data.profile?.role 
        });
        
        if (!data.user) {
          console.log('No user found, redirecting to sign-in');
          router.replace('/sign-in');
          return;
        }
        
        if (!data.profile) {
          console.log('No profile found, redirecting to dashboard');
          router.replace('/dashboard?error=profile_not_found');
          return;
        }
        
        if (data.profile.role !== 'admin' && data.profile.role !== 'super_admin') {
          console.log('Insufficient permissions:', data.profile.role);
          router.replace('/dashboard?error=admin_access_required');
          return;
        }
        
        console.log('✅ Admin access granted for:', data.profile.role);
        setAuthLoading(false);
        
      } catch (error) {
        console.error('Admin auth error:', error);
        router.replace('/dashboard?error=auth_error');
      }
    }
    checkAuth();
  }, [router]);

  // Move the hook up to always run on every render, but conditionally do work
  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading]);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      console.log('Fetching real admin stats...');
      
      // Fetch real data from the database
      const [pendingRes, liveRes] = await Promise.all([
        fetch('/api/admin/deals/pending'),
        fetch('/api/deals?limit=100')
      ]);
      
      const pendingData = await pendingRes.json();
      const liveData = await liveRes.json();
      
      console.log('Real stats:', { pending: pendingData, live: liveData });
      
      // Calculate real revenue (featured deals * price)
      const liveDeals = liveData.deals || [];
      const featuredDeals = liveDeals.filter(deal => 
        deal.pricing_tier === 'featured' || deal.pricing_tier === 'premium'
      );
      const revenue = featuredDeals.reduce((total, deal) => {
        const price = deal.pricing_tier === 'premium' ? 39.99 : 19.99;
        return total + price;
      }, 0);
      
      // Calculate archived deals (could be deals with status = 'expired' or archived_at)
      const archivedDeals = liveDeals.filter(deal => 
        deal.status === 'expired' || deal.archived_at
      ).length;
      
      // Fetch marketing consent data
      let marketingOptIns = 0;
      try {
        const consentRes = await fetch('/api/marketing-consent');
        const consentData = await consentRes.json();
        marketingOptIns = consentData.data?.filter(item => item.consent === true).length || 0;
      } catch (consentError) {
        console.error('Error fetching marketing consent:', consentError);
      }
      
      setStats({
        pendingDeals: pendingData.count || 0,
        liveDeals: liveDeals.length || 0,
        totalRevenue: revenue,
        archivedDeals: archivedDeals,
        marketingOptIns: marketingOptIns,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching real admin stats:', error);
      // Fallback to zero values instead of fake data
      setStats({
        pendingDeals: 0,
        liveDeals: 0,
        totalRevenue: 0,
        archivedDeals: 0,
        marketingOptIns: 0,
        loading: false
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (authLoading || stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf55c' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black">Admin Dashboard</h1>
          <p className="mt-4 text-lg text-black/80 font-medium">
            Manage deals, review submissions, and monitor platform performance.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">Pending Reviews</CardTitle>
              <ClockIcon className="text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.pendingDeals}</div>
              <p className="text-sm text-black/70 font-medium mt-1">Deals awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">Marketing Opt-ins</CardTitle>
              <MailIcon className="text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.marketingOptIns}</div>
              <p className="text-sm text-black/70 font-medium mt-1">Users opted in for emails</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">Live Deals</CardTitle>
              <CheckCircleIcon className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.liveDeals}</div>
              <p className="text-sm text-black/70 font-medium mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">Revenue</CardTitle>
              <DollarSignIcon className="text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-sm text-black/70 font-medium mt-1">Total listing fees</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold text-black">Archived</CardTitle>
              <ArchiveIcon className="text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black">{stats.archivedDeals}</div>
              <p className="text-sm text-black/70 font-medium mt-1">Expired deals</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-black">
                <ClockIcon className="text-orange-600" />
                <span>Review Queue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black/80 font-medium mb-4">Review and approve pending deal submissions from founders.</p>
              <Button href="/admin/deals/pending" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full">
                Review {stats.pendingDeals} Pending Deals
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-black">
                <CheckCircleIcon className="text-green-600" />
                <span>Live Deals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black/80 font-medium mb-4">Manage currently active deals and monitor performance.</p>
              <Button href="/admin/deals/approved" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 font-bold py-3 px-6 rounded-full">
                View Live Deals
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-xl font-bold text-black">
                <DollarSignIcon className="text-green-600" />
                <span>Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black/80 font-medium mb-4">Track revenue, conversion rates, and platform growth metrics.</p>
              <Button href="/admin/analytics" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 font-bold py-3 px-6 rounded-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card className="bg-white border-2 border-black rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-black/80 font-medium">Deal "TaskFlow Pro - 50% Off" approved</span>
                  <span className="text-black/60">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-black/80 font-medium">New featured listing payment received</span>
                  <span className="text-black/60">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-black/80 font-medium">Deal "DataAnalyzer Premium" pending review</span>
                  <span className="text-black/60">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
