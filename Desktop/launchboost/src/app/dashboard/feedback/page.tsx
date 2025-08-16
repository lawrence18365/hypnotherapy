import React from 'react';
import { Metadata } from 'next';
import { FeedbackInbox } from '@/components/dashboard/feedback-inbox';

export const metadata: Metadata = {
  title: 'Feedback Inbox | LaunchBoost Dashboard',
  description: 'View and manage feedback and reviews for your deals',
};

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback Inbox</h1>
        <p className="text-gray-600">
          View and respond to reviews and feedback on your deals
        </p>
      </div>

      <FeedbackInbox />
    </div>
  );
}