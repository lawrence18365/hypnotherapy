'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MessageSquare, Star, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

// Helper function to format time ago without external dependency
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Simple Avatar component without external dependencies
const SimpleAvatar = ({ src, fallback, size = 'default' }: {
  src?: string;
  fallback: string;
  size?: 'sm' | 'default' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    default: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={fallback}
        className={`${sizeClasses[size]} rounded-full bg-gray-200 object-cover`}
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600`}>
      {fallback}
    </div>
  );
};

interface Deal {
  id: string;
  title: string;
  avg_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  is_verified_purchase: boolean;
  deal: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface FeedbackStats {
  totalReviews: number;
  averageRating: number;
  recentReviews: number;
}

export function FeedbackInbox() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalReviews: 0,
    averageRating: 0,
    recentReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      
      // This would normally fetch from an API endpoint
      // For now, we'll simulate the data structure
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real implementation, this would come from API
      setStats({
        totalReviews: 0,
        averageRating: 0,
        recentReviews: 0,
      });
      
      setDeals([]);
      setRecentReviews([]);
      
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-3">Loading feedback...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchFeedbackData} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Reviews</p>
                <p className="text-2xl font-bold">{stats.recentReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
          <TabsTrigger value="deals">Deal Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats.totalReviews === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-6">
                When customers start reviewing your deals, you'll see their feedback here.
              </p>
              <Link href="/submit-deal">
                <Button>Submit Your First Deal</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentReviews.length > 0 ? (
                    recentReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <SimpleAvatar 
                            src={review.user.avatar_url} 
                            fallback={getInitials(review.user.full_name || review.user.username || 'U')}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <StarRatingDisplay rating={review.rating} size="sm" />
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(new Date(review.created_at))}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{review.deal.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {review.review_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent reviews</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Rated Deals */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Rated Deals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deals.length > 0 ? (
                    deals
                      .filter(deal => deal.review_count > 0)
                      .sort((a, b) => b.avg_rating - a.avg_rating)
                      .slice(0, 3)
                      .map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{deal.title}</p>
                            <StarRatingDisplay
                              rating={deal.avg_rating}
                              reviewCount={deal.review_count}
                              size="sm"
                            />
                          </div>
                          <Link href={`/feedback/${deal.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm">No rated deals yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <SimpleAvatar 
                      src={review.user.avatar_url} 
                      fallback={getInitials(review.user.full_name || review.user.username || 'U')}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">
                          {review.user.full_name || review.user.username}
                        </h4>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(new Date(review.created_at))}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-blue-600 mb-2">
                        {review.deal.title}
                      </p>
                      
                      <StarRatingDisplay
                        rating={review.rating}
                        size="sm"
                        className="mb-3"
                      />
                      
                      <p className="text-gray-700 leading-relaxed">
                        {review.review_text}
                      </p>
                    </div>
                    
                    <Link href={`/feedback/${review.deal.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Deal
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No recent reviews</h3>
              <p className="text-gray-500">New reviews will appear here when customers leave feedback.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          {deals.length > 0 ? (
            deals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{deal.title}</h3>
                      <div className="mt-2">
                        <StarRatingDisplay
                          rating={deal.avg_rating}
                          reviewCount={deal.review_count}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/feedback/${deal.id}`}>
                        <Button variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Reviews
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No deals submitted yet</h3>
              <p className="text-gray-500 mb-6">
                Submit your first deal to start receiving reviews and feedback.
              </p>
              <Link href="/submit-deal">
                <Button>Submit Deal</Button>
              </Link>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}