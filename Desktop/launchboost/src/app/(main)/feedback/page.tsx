import { Suspense } from "react"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getCurrentUserServer } from "@/lib/server/auth"
import { redirect } from 'next/navigation'
import { TicketSubmissionForm } from "@/components/tickets/ticket-submission-form"
import { TicketsList } from "@/components/tickets/tickets-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Star, Users, TrendingUp, Lightbulb, Bug, Plus, ArrowUp, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PublicTicketsPage() {
  const user = await getCurrentUserServer()

  // No authentication required - feedback should be accessible to everyone

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="py-16 md:py-24 px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
            <Lightbulb className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Shape LaunchBoost's Future
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium mb-12 leading-relaxed">
            Submit feature requests, vote on ideas, and help us build the platform you need. 
            Your voice drives our roadmap!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="browse" className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              {/* FIX: 
                - The container div was removed. Styles were moved to TabsList.
                - The grid layout on TabsList was removed in favor of the flex default.
                - TabsTrigger classes were simplified for a cleaner implementation.
              */}
              <TabsList className="inline-flex items-center justify-center rounded-xl bg-white p-1 border-2 border-black shadow-lg">
                <TabsTrigger
                  value="browse"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-black data-[state=active]:text-yellow-400 data-[state=active]:shadow-sm min-w-[180px] space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Browse Requests</span>
                </TabsTrigger>
                <TabsTrigger
                  value="submit"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-3 text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-black data-[state=active]:text-yellow-400 data-[state=active]:shadow-sm min-w-[180px] space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Request</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="bg-black text-yellow-400 px-4 py-3 rounded-xl font-bold text-sm">
                💡 <strong>Tip:</strong> Vote on features you want to see!
              </div>
            </div>

            {/* Browse Tickets Tab */}
            <TabsContent value="browse" className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar with info */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <ArrowUp className="h-5 w-5 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black">How It Works</h3>
                    </div>
                    <div className="space-y-4 text-black/80 font-medium">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <p>Submit feature requests and improvements</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <p>Vote on ideas you want to see built</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <p>Comment and discuss with the community</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                        <p>Get updates when features go live</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black border-2 border-black rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 text-black" />
                      </div>
                      <h3 className="text-xl font-bold text-yellow-400">Popular Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">UI/UX</span>
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">Dashboard</span>
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">API</span>
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">Mobile</span>
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">Analytics</span>
                      <span className="px-3 py-1 text-sm bg-yellow-400 text-black rounded-full font-bold">Integrations</span>
                    </div>
                  </div>
                </div>

                {/* Main tickets list */}
                <div className="lg:col-span-3">
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-lg">
                    <Suspense fallback={
                      <div className="space-y-4">
                        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
                      </div>
                    }>
                      <TicketsList user={user} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Submit Ticket Tab */}
            <TabsContent value="submit" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-black">Submit Your Idea</h2>
                        <p className="text-black/80 font-medium">
                          Help us build what you need! All submissions are public and can be voted on by the community.
                        </p>
                      </div>
                    </div>
                    
                    <Suspense fallback={
                      <div className="space-y-4">
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                      </div>
                    }>
                      <TicketSubmissionForm user={user} />
                    </Suspense>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black">Submission Guidelines</h3>
                    </div>
                    
                    <div className="space-y-6 text-black/80 font-medium">
                      <div>
                        <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                          <span>✨</span> Great Feature Requests Include:
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Clear problem description</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Specific use case examples</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Expected behavior</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Why it would help you</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                          <span>🐛</span> Bug Reports Should Include:
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Steps to reproduce</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Expected vs actual behavior</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Browser/device info</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-black font-bold">•</span>
                            <span>Screenshots if helpful</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black border-2 border-black rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-black" />
                      </div>
                      <h3 className="text-xl font-bold text-yellow-400">What Happens Next?</h3>
                    </div>
                    
                    <div className="space-y-4 text-white/90 font-medium text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 text-black rounded-lg flex items-center justify-center font-bold text-xs mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="font-bold text-yellow-400 mb-1">Community Review</p>
                          <p>Your idea goes live for community voting</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 text-black rounded-lg flex items-center justify-center font-bold text-xs mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="font-bold text-yellow-400 mb-1">Team Evaluation</p>
                          <p>Our team reviews popular requests</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-400 text-black rounded-lg flex items-center justify-center font-bold text-xs mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="font-bold text-yellow-400 mb-1">Development</p>
                          <p>Selected features get built and released</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}