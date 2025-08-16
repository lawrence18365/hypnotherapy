"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { MessageSquare, Star, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface FeedbackFormProps {
  user: User | null;
}

type FeedbackType = 'general' | 'deal_review' | 'bug_report' | 'feature_request';

export function FeedbackForm({ user }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
    rating: 0,
    dealUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const feedbackTypes = [
    { 
      id: 'general' as FeedbackType, 
      title: 'General Feedback', 
      description: 'Share thoughts about LaunchBoost' 
    },
    { 
      id: 'deal_review' as FeedbackType, 
      title: 'Deal Review', 
      description: 'Review a specific deal you tried' 
    },
    { 
      id: 'bug_report' as FeedbackType, 
      title: 'Bug Report', 
      description: 'Report a technical issue' 
    },
    { 
      id: 'feature_request' as FeedbackType, 
      title: 'Feature Request', 
      description: 'Suggest new features' 
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          feedbackType,
          userId: user?.id || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Reset form
        setFormData({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          subject: '',
          message: '',
          rating: 0,
          dealUrl: ''
        });
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="text-center p-8">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-600 mb-6">
          Your feedback has been submitted successfully. We'll review it and get back to you if needed.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Submit More Feedback
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">What type of feedback would you like to share?</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feedbackTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all ${
                feedbackType === type.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setFeedbackType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 w-4 h-4 rounded-full border-2 ${
                    feedbackType === type.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {feedbackType === type.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{type.title}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Only needed if you want a response
            </p>
          </div>
        </div>
      )}

      {/* Deal-specific fields */}
      {feedbackType === 'deal_review' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dealUrl">Deal URL or Name</Label>
            <Input
              id="dealUrl"
              value={formData.dealUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, dealUrl: e.target.value }))}
              placeholder="Link to the deal or just the product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              size="lg"
            />
            <p className="text-xs text-muted-foreground">
              How would you rate this deal overall?
            </p>
          </div>
        </div>
      )}

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Brief summary of your feedback"
          required
        />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Please share your detailed feedback..."
          rows={6}
          required
        />
      </div>

      {/* Login prompt for better experience */}
      {!user && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Want to review specific deals?
                </p>
                <p className="text-sm text-blue-700 mb-3">
                  Sign in to leave reviews on deals you've actually tried and help other users make better decisions.
                </p>
                <Link href="/sign-in">
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </>
        )}
      </Button>
    </form>
  );
}