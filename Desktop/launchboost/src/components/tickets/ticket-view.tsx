"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { ArrowUp, MessageSquare, Lightbulb, Bug, Plus, Clock, CheckCircle, XCircle, Pause, ArrowLeft, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

interface TicketViewProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    ticket_type: 'feature_request' | 'improvement' | 'bug_report' | 'question';
    status: 'open' | 'in_progress' | 'completed' | 'closed' | 'wont_fix';
    priority: 'low' | 'medium' | 'high';
    upvotes_count: number;
    comments_count: number;
    slug: string;
    created_at: string;
    updated_at: string;
    author_name: string | null;
    admin_response: string | null;
    profiles: {
      id: string;
      full_name: string;
      username: string;
      avatar_url: string;
      role: string;
    } | null;
  };
  hasUpvoted: boolean;
  user: User | null;
}

const typeConfig = {
  feature_request: { 
    icon: Lightbulb, 
    label: 'Feature Request', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Community suggestion for new functionality'
  },
  improvement: { 
    icon: Plus, 
    label: 'Improvement', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Enhancement to existing features'
  },
  bug_report: { 
    icon: Bug, 
    label: 'Bug Report', 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Technical issue or problem report'
  },
  question: { 
    icon: MessageSquare, 
    label: 'Question', 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Community question or inquiry'
  }
};

const statusConfig = {
  open: { 
    icon: Clock, 
    label: 'Open', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Under review by the team'
  },
  in_progress: { 
    icon: Clock, 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Currently being worked on'
  },
  completed: { 
    icon: CheckCircle, 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Successfully implemented'
  },
  closed: { 
    icon: XCircle, 
    label: 'Closed', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Resolved without implementation'
  },
  wont_fix: { 
    icon: Pause, 
    label: 'Won\'t Fix', 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Not planned for implementation'
  }
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low Priority' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Priority' },
  high: { color: 'bg-red-100 text-red-800', label: 'High Priority' }
};

export function TicketView({ ticket, hasUpvoted, user }: TicketViewProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [currentUpvoted, setCurrentUpvoted] = useState(hasUpvoted);
  const [currentUpvotes, setCurrentUpvotes] = useState(ticket.upvotes_count);

  const typeInfo = typeConfig[ticket.ticket_type];
  const statusInfo = statusConfig[ticket.status];
  const priorityInfo = priorityConfig[ticket.priority];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const handleUpvote = async () => {
    if (!user) {
      // Could show a sign-in modal here
      return;
    }

    if (isUpvoting) return;

    setIsUpvoting(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.slug}/upvote`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUpvoted(data.hasUpvoted);
        setCurrentUpvotes(data.upvotes_count);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link 
          href="/feedback" 
          className="flex items-center space-x-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to requests</span>
        </Link>
        <span>•</span>
        <span>#{ticket.slug.split('-').pop()}</span>
      </div>

      {/* Main Ticket Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className={typeInfo.color}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {typeInfo.label}
                </Badge>
                <Badge variant="outline" className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className={priorityInfo.color}>
                  {priorityInfo.label}
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-tight mb-2">
                {ticket.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {typeInfo.description} • {statusInfo.description}
              </p>
            </div>

            {/* Upvote Button */}
            <Button 
              variant={currentUpvoted ? "default" : "outline"}
              size="lg"
              className={`flex flex-col items-center p-4 h-auto min-w-[80px] ${
                currentUpvoted ? 'bg-blue-600 hover:bg-blue-700' : ''
              }`}
              onClick={handleUpvote}
              disabled={isUpvoting || !user}
            >
              <ArrowUp className={`h-5 w-5 ${currentUpvoted ? 'text-white' : ''}`} />
              <span className={`text-sm font-medium ${currentUpvoted ? 'text-white' : ''}`}>
                {currentUpvotes}
              </span>
              <span className={`text-xs ${currentUpvoted ? 'text-blue-100' : 'text-muted-foreground'}`}>
                {currentUpvoted ? 'Upvoted' : 'Upvote'}
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Admin Response */}
          {ticket.admin_response && (
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Official Response
                </Badge>
              </div>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {ticket.admin_response}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            {/* Author Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={ticket.profiles?.avatar_url} />
                <AvatarFallback>
                  {ticket.profiles?.full_name?.[0] || ticket.author_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {ticket.profiles?.full_name || ticket.author_name || 'Anonymous'}
                  </span>
                  {ticket.profiles?.role === 'admin' && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                      Team
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Created {formatDistanceToNow(new Date(ticket.created_at))} ago
                  </span>
                  {ticket.updated_at !== ticket.created_at && (
                    <>
                      <span>•</span>
                      <span>Updated {formatDistanceToNow(new Date(ticket.updated_at))} ago</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <ArrowUp className="h-4 w-4" />
                <span>{currentUpvotes} {currentUpvotes === 1 ? 'upvote' : 'upvotes'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{ticket.comments_count} {ticket.comments_count === 1 ? 'comment' : 'comments'}</span>
              </div>
            </div>
          </div>

          {/* Sign-in prompt for anonymous users */}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    Join the conversation
                  </p>
                  <p className="text-sm text-blue-700 mb-3">
                    Sign in to upvote this request and add your comments to help shape the discussion.
                  </p>
                  <Link href="/sign-in">
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}