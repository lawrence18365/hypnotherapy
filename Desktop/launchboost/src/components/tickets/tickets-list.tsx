"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpvoteButton } from './upvote-button';
import { User } from '@supabase/supabase-js';
import { ArrowUp, MessageSquare, Lightbulb, Bug, Plus, Clock, CheckCircle, XCircle, Pause, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TicketsListProps {
  user: User | null;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  ticket_type: 'feature_request' | 'improvement' | 'bug_report' | 'question';
  status: 'open' | 'in_progress' | 'completed' | 'closed' | 'wont_fix';
  priority: 'low' | 'medium' | 'high';
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  user_has_upvoted?: boolean;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
  } | null;
}

const typeConfig = {
  feature_request: { 
    icon: Lightbulb, 
    label: 'Feature Request', 
    color: 'bg-yellow-100 text-black border-black' 
  },
  improvement: { 
    icon: Plus, 
    label: 'Improvement', 
    color: 'bg-yellow-100 text-black border-black' 
  },
  bug_report: { 
    icon: Bug, 
    label: 'Bug Report', 
    color: 'bg-yellow-100 text-black border-black' 
  },
  question: { 
    icon: MessageSquare, 
    label: 'Question', 
    color: 'bg-yellow-100 text-black border-black' 
  }
};

const statusConfig = {
  open: { 
    icon: Clock, 
    label: 'Open', 
    color: 'bg-white text-black border-black' 
  },
  in_progress: { 
    icon: Clock, 
    label: 'In Progress', 
    color: 'bg-black text-yellow-400 border-black' 
  },
  completed: { 
    icon: CheckCircle, 
    label: 'Completed', 
    color: 'bg-black text-yellow-400 border-black' 
  },
  closed: { 
    icon: XCircle, 
    label: 'Closed', 
    color: 'bg-white text-black border-black' 
  },
  wont_fix: { 
    icon: Pause, 
    label: 'Won\'t Fix', 
    color: 'bg-white text-black border-black' 
  }
};

export function TicketsList({ user }: TicketsListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setTickets(data.tickets);
      } else {
        setError(data.error || 'Failed to load tickets');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, typeFilter]);

  const toggleTicketExpansion = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
          <Button 
            onClick={fetchTickets} 
            variant="outline" 
            className="mt-4"
            size="sm"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-600 sm:ml-auto">
          {tickets.length} {tickets.length === 1 ? 'request' : 'requests'}
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">No requests yet</h3>
            <p className="text-blue-600 mb-4">
              Be the first to suggest a feature or improvement!
            </p>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                // Switch to submit tab
                const submitTab = document.querySelector('[value="submit"]') as HTMLElement;
                submitTab?.click();
              }}
            >
              Submit First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const typeInfo = typeConfig[ticket.ticket_type];
            const statusInfo = statusConfig[ticket.status];
            const TypeIcon = typeInfo.icon;
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedTickets.has(ticket.id);

            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <button 
                          onClick={() => toggleTicketExpansion(ticket.id)}
                          className="group text-left w-full"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-600 transition-colors">
                              {ticket.title}
                            </h3>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </button>
                        <p className={`text-muted-foreground mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {ticket.description}
                        </p>
                      </div>

                      {/* Animated Upvote Button */}
                      <UpvoteButton
                        ticketId={ticket.id}
                        initialCount={ticket.upvotes_count}
                        initialUpvoted={ticket.user_has_upvoted || false}
                        disabled={!user}
                      />
                    </div>

                    {/* Badges and Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="outline" className={typeInfo.color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        <Badge variant="outline" className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.comments_count}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(ticket.created_at))} ago</span>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={ticket.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {ticket.profiles?.full_name?.[0] || ticket.author_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        by {ticket.profiles?.full_name || ticket.author_name || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}