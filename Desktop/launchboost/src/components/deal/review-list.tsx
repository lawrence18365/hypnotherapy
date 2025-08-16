'use client';

import React, { useState, useEffect } from 'react';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
  is_verified_purchase: boolean;
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

interface ReviewListProps {
  dealId: string;
  refreshTrigger?: number;
  className?: string;
}

export function ReviewList({ dealId, refreshTrigger = 0, className }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchReviews = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/reviews/${dealId}?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      if (reset || pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }

      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
      setHasMore(data.hasMore || false);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, true);
  }, [dealId, refreshTrigger]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, false);
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
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">Error loading reviews: {error}</p>
        <Button 
          onClick={() => fetchReviews(1, true)} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Reviews Summary */}
      {totalReviews > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
                <StarRatingDisplay
                  rating={averageRating}
                  reviewCount={totalReviews}
                  size="lg"
                />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-500">out of 5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to share your experience with this deal!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.user.avatar_url} />
                    <AvatarFallback>
                      {getInitials(review.user.full_name || review.user.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {review.user.full_name || review.user.username}
                      </h4>
                      {review.is_verified_purchase && (
                        <Badge variant="secondary" className="text-xs">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <StarRatingDisplay
                      rating={review.rating}
                      size="sm"
                      className="mb-3"
                    />
                    
                    {review.review_text && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.review_text}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}