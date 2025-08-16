"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { Lightbulb, Bug, MessageSquare, Plus, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TicketSubmissionFormProps {
  user: User | null;
}

type TicketType = 'feature_request' | 'improvement' | 'bug_report' | 'question';

const ticketTypes = [
  { 
    id: 'feature_request' as TicketType, 
    title: 'Feature Request', 
    description: 'Suggest a new feature or capability',
    icon: Lightbulb,
    color: 'bg-yellow-50 border-yellow-200 text-black'
  },
  { 
    id: 'improvement' as TicketType, 
    title: 'Improvement', 
    description: 'Suggest improvements to existing features',
    icon: Plus,
    color: 'bg-yellow-50 border-yellow-200 text-black'
  },
  { 
    id: 'bug_report' as TicketType, 
    title: 'Bug Report', 
    description: 'Report a technical issue or problem',
    icon: Bug,
    color: 'bg-yellow-50 border-yellow-200 text-black'
  },
  { 
    id: 'question' as TicketType, 
    title: 'Question', 
    description: 'Ask questions about features or usage',
    icon: MessageSquare,
    color: 'bg-yellow-50 border-yellow-200 text-black'
  }
];

export function TicketSubmissionForm({ user }: TicketSubmissionFormProps) {
  const router = useRouter();
  const [ticketType, setTicketType] = useState<TicketType>('feature_request');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author_name: user?.user_metadata?.full_name || '',
    author_email: user?.email || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ticket_type: ticketType
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          author_name: user?.user_metadata?.full_name || '',
          author_email: user?.email || ''
        });
        
        // Redirect to the new ticket after a short delay
        setTimeout(() => {
          router.push(`/tickets/${result.ticket.slug}`);
        }, 2000);
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
      <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Request Submitted!</h3>
        <p className="text-green-600 mb-4">
          Your request has been published and is now live for community voting.
        </p>
        <p className="text-sm text-green-700 mb-6">
          Redirecting to your ticket...
        </p>
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket Type Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">What type of request is this?</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ticketTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${
                  ticketType === type.id 
                    ? type.color + ' ring-2 ring-opacity-50' 
                    : 'hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setTicketType(type.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      ticketType === type.id 
                        ? 'bg-white bg-opacity-70' 
                        : 'bg-gray-50'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        ticketType === type.id ? type.color.split(' ')[2] : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      ticketType === type.id 
                        ? 'border-current bg-current' 
                        : 'border-gray-300'
                    }`}>
                      {ticketType === type.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contact Information for Anonymous Users */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="md:col-span-2 mb-2">
            <div className="flex items-center space-x-2 text-blue-700 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Anonymous Submission</span>
            </div>
            <p className="text-xs text-blue-600">
              You're submitting anonymously. Provide your name so the community knows who suggested this great idea!
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author_name">Your Name <span className="text-red-500">*</span></Label>
            <Input
              id="author_name"
              value={formData.author_name}
              onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author_email">Email (Optional)</Label>
            <Input
              id="author_email"
              type="email"
              value={formData.author_email}
              onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Only if you want updates about this request
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={
            ticketType === 'feature_request' ? 'Add dark mode support' :
            ticketType === 'improvement' ? 'Improve dashboard loading speed' :
            ticketType === 'bug_report' ? 'Login button not working on mobile' :
            'How do I export my data?'
          }
          required
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          Keep it clear and concise ({formData.title.length}/100 characters)
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={
            ticketType === 'feature_request' ? 
              'Describe the feature you\'d like to see. What problem would it solve? How would you use it? Include specific examples if possible.' :
            ticketType === 'improvement' ? 
              'What could be improved and how? Describe the current experience and what you\'d like to see changed.' :
            ticketType === 'bug_report' ? 
              'Describe what happened, what you expected to happen, and steps to reproduce the issue. Include browser/device info if relevant.' :
              'What would you like to know? Provide context about what you\'re trying to accomplish.'
          }
          rows={6}
          required
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          Be as detailed as possible ({formData.description.length}/2000 characters)
        </p>
      </div>

      {/* Public Notice */}
      <div className="p-4 bg-yellow-50 border-2 border-black rounded-lg">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-black mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-black font-medium mb-1">
              This will be public
            </p>
            <p className="text-sm text-black">
              Your request will be visible to all visitors and can be voted on by the community. 
              This helps us prioritize what to build next!
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-black text-sm p-3 bg-yellow-50 border-2 border-black rounded font-bold">
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
            Publishing Request...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Publish Request
          </>
        )}
      </Button>
    </form>
  );
}