import React from 'react';
import { ReviewForm } from '@/components/deal/review-form';
import { ReviewList } from '@/components/deal/review-list';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FeedbackPageProps {
  params: {
    dealId: string;
  };
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const { dealId } = params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6" />
                Deal Reviews & Feedback
              </CardTitle>
              <p className="text-gray-600">
                Share your experience and read what others have to say about this deal.
              </p>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <ReviewForm 
              dealId={dealId}
              onReviewSubmitted={() => {
                // Trigger refresh of review list
                window.location.reload();
              }}
            />
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <ReviewList dealId={dealId} />
          </div>
        </div>
      </div>
    </div>
  );
}