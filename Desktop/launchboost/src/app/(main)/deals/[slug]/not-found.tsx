"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, TrendingUp } from 'lucide-react';

export default function DealNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Back Button */}
        <div className="mb-6 text-left">
          <Link 
            href="/deals" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Deals
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Deal Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sorry, we couldn't find the deal you're looking for. It may have expired, been removed, or the link might be incorrect.
            </p>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">This might have happened because:</p>
                <ul className="text-left list-disc list-inside space-y-1">
                  <li>The deal has expired and is no longer available</li>
                  <li>The deal was removed by the founder</li>
                  <li>The link you followed is outdated or incorrect</li>
                  <li>You don't have permission to view this deal</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/deals"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-600/90 h-10 px-4 py-2"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Browse All Deals
              </Link>
              
              <Link 
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 border border-gray-300 bg-transparent hover:bg-gray-100 h-10 px-4 py-2"
              >
                Go Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}