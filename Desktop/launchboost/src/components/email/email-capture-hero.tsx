"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmailCaptureModal } from './email-capture-modal';
import { TrendingUp, Zap, Clock, Mail, ArrowRight, Sparkles, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface EmailCaptureHeroProps {
  user: any;
  stats: {
    total: number;
    featured: number;
  };
}

export function EmailCaptureHero({ user, stats }: EmailCaptureHeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | undefined>(undefined);

  // Fetch subscriber count for social proof
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const response = await fetch('/api/newsletter/subscribe');
        const data = await response.json();
        setSubscriberCount(data.count);
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
      }
    };

    fetchSubscriberCount();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-16 section-premium animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-balance">
            Get an Unfair{" "}
            <span className="text-gradient-primary">
              Advantage
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-balance max-w-3xl mx-auto leading-relaxed">
            50-90% off the best new tools for builders. We convince the hottest new founders to give our community exclusive launch-day deals. Their first users are your secret weapon.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="badge-success flex items-center space-x-3 px-6 py-3 rounded-full">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">New Deals Weekly</span>
            </div>
            <div className="badge-premium bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-3 px-6 py-3 rounded-full">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Exclusive Access</span>
            </div>
            <div className="badge-warning flex items-center space-x-3 px-6 py-3 rounded-full">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Limited Time</span>
            </div>
          </div>

          {!user ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-4 h-auto" 
                onClick={() => setIsModalOpen(true)}
              >
                <Mail className="h-5 w-5 mr-2" />
                Never Miss a Deal
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-4 h-auto" asChild>
                <Link href="#deals">
                  Browse Deals
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in">
              <Button size="lg" className="btn-primary text-lg px-8 py-4 h-auto" asChild>
                <Link href="/dashboard/deals/new">
                  <Zap className="h-5 w-5 mr-2" />
                  Submit Your Deal
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-4 h-auto" asChild>
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriberCount={subscriberCount}
      />
    </>
  );
}
