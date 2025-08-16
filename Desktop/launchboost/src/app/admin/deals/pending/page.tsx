"use client";

import React, { useState, useEffect } from 'react';

// --- Icons ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

// --- UI Components ---
const Card = ({ children, className = '' }) => <div className={`border bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-600/90",
    destructive: "bg-red-600 text-white hover:bg-red-600/90",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
    ghost: "hover:bg-gray-100"
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-8 px-3 text-sm" };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>
}

const Textarea = ({ className = '', ...props }) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

export default function PendingDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingDeals, setProcessingDeals] = useState(new Set());
  const [rejectionReasons, setRejectionReasons] = useState({});

  useEffect(() => {
    fetchPendingDeals();
  }, []);

  const fetchPendingDeals = async () => {
    try {
      const response = await fetch('/api/admin/deals/pending');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      } else {
        console.error('Failed to fetch pending deals');
      }
    } catch (error) {
      console.error('Error fetching pending deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (dealId) => {
    setProcessingDeals(prev => new Set(prev).add(dealId));
    
    try {
      const response = await fetch('/api/admin/deals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId })
      });
      
      if (response.ok) {
        setDeals(prev => prev.filter(deal => deal.id !== dealId));
        alert('Deal approved successfully!');
      } else {
        const error = await response.json();
        alert('Failed to approve deal: ' + error.message);
      }
    } catch (error) {
      console.error('Error approving deal:', error);
      alert('Error approving deal');
    } finally {
      setProcessingDeals(prev => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
    }
  };

  const handleReject = async (dealId) => {
    const reason = rejectionReasons[dealId];
    if (!reason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessingDeals(prev => new Set(prev).add(dealId));
    
    try {
      const response = await fetch('/api/admin/deals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, reason: reason.trim() })
      });
      
      if (response.ok) {
        setDeals(prev => prev.filter(deal => deal.id !== dealId));
        setRejectionReasons(prev => {
          const next = { ...prev };
          delete next[dealId];
          return next;
        });
        alert('Deal rejected successfully!');
      } else {
        const error = await response.json();
        alert('Failed to reject deal: ' + error.message);
      }
    } catch (error) {
      console.error('Error rejecting deal:', error);
      alert('Error rejecting deal');
    } finally {
      setProcessingDeals(prev => {
        const next = new Set(prev);
        next.delete(dealId);
        return next;
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pending deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pending Deal Approvals</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Review and approve deals submitted by founders. {deals.length} deal{deals.length !== 1 ? 's' : ''} awaiting review.
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending deals</h3>
            <p className="text-gray-500">All deals have been reviewed. Great work!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {deals.map((deal) => (
            <Card key={deal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{deal.title}</CardTitle>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{deal.category}</Badge>
                      <Badge variant={deal.pricing_tier === 'free' ? 'default' : deal.pricing_tier === 'featured' ? 'warning' : 'success'}>
                        {deal.pricing_tier === 'free' ? 'Free Listing' : deal.pricing_tier === 'featured' ? 'Featured ($19.99)' : 'Premium ($39.99)'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        by {deal.founder_name || deal.founder_email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(deal.product_website, '_blank')}
                      variant="outline"
                    >
                      <ExternalLinkIcon />
                      Visit Site
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Deal Overview */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Product</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{deal.product_name}</p>
                    <a href={deal.product_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                      {deal.product_website}
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pricing</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{formatPrice(deal.deal_price)}</span>
                      <span className="text-sm text-gray-500 line-through">{formatPrice(deal.original_price)}</span>
                      <Badge variant="success">{deal.discount_percentage}% OFF</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{deal.total_codes} codes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Expires: {new Date(deal.expires_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{deal.short_description}</p>
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{deal.description}</p>
                  </div>
                </div>

                {/* Tags */}
                {deal.tags && deal.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason Input */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rejection Reason (if rejecting)</h4>
                  <Textarea
                    placeholder="Explain why this deal should be rejected..."
                    value={rejectionReasons[deal.id] || ''}
                    onChange={(e) => setRejectionReasons(prev => ({
                      ...prev,
                      [deal.id]: e.target.value
                    }))}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(deal.id)}
                    disabled={processingDeals.has(deal.id)}
                  >
                    <XIcon />
                    {processingDeals.has(deal.id) ? 'Rejecting...' : 'Reject Deal'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(deal.id)}
                    disabled={processingDeals.has(deal.id)}
                  >
                    <CheckIcon />
                    {processingDeals.has(deal.id) ? 'Approving...' : 'Approve Deal'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}