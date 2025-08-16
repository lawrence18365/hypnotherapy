"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';
import { MessageSquare, Send, CheckCircle, Crown, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface TicketCommentsProps {
  ticketSlug: string;
  comments: Comment[];
  user: User | null;
}

interface Comment {
  id: string;
  content: string;
  is_admin_response: boolean;
  is_solution: boolean;
  author_name: string | null;
  author_email: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    role: string;
  } | null;
}

export function TicketComments({ ticketSlug, comments: initialComments, user }: TicketCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    author_name: user?.user_metadata?.full_name || '',
    author_email: user?.email || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) return;
    if (!user && !formData.author_name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/tickets/${ticketSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Add new comment to the list
        setComments(prev => [...prev, result.comment]);
        
        // Reset form
        setFormData({
          content: '',
          author_name: user?.user_metadata?.full_name || '',
          author_email: user?.email || ''
        });
      } else {
        console.error('Error submitting comment:', result.error);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Discussion ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-2">No comments yet</p>
            <p className="text-sm">Be the first to join the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className={`space-y-3 ${
                  comment.is_admin_response 
                    ? 'border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg' 
                    : index > 0 
                    ? 'border-t pt-4' 
                    : ''
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles?.full_name?.[0] || comment.author_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {comment.profiles?.full_name || comment.author_name || 'Anonymous'}
                      </span>
                      
                      {/* Role badges */}
                      {comment.profiles?.role === 'admin' && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Team
                        </Badge>
                      )}
                      
                      {comment.is_admin_response && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          Official Response
                        </Badge>
                      )}
                      
                      {comment.is_solution && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Solution
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </span>
                </div>

                {/* Comment Content */}
                <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  comment.is_admin_response ? 'text-blue-800' : ''
                }`}>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        <div className="border-t pt-6">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user.user_metadata?.full_name?.[0] || user.email?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Add your comment</Label>
                <Textarea
                  id="comment"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or ask questions..."
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.content.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </form>
          ) : (
            // Anonymous comment form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-blue-700 mb-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Anonymous Comment</span>
                </div>
                <p className="text-xs text-blue-600">
                  You can comment without signing in, but consider{' '}
                  <Link href="/sign-in" className="underline font-medium">
                    signing in
                  </Link>{' '}
                  for a better experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author_name">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
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
                    Only if you want to be notified of responses
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Your Comment</Label>
                <Textarea
                  id="comment"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, suggestions, or ask questions..."
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.content.trim() || !formData.author_name.trim()}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}