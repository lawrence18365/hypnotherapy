"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  DollarSign,
  Rocket,
  Clock,
  Gift,
  MapPin,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function AdvertisePage() {
  const pricingTiers = [
    {
      name: "Sidebar Spot",
      price: "$7",
      period: "7 days",
      description: "Small sponsor card in category sections (5 spots total)",
      spots: "5 available",
      location: "Category swim lanes sidebar",
      features: [
        "Shows in 5 category sections",
        "Small sponsor card format",
        "7-day active period",
        "Click tracking included",
        "Mobile responsive placement",
        "Direct link to your site"
      ],
      buttonText: "Get Sidebar Spot",
      href: "/advertise/purchase?type=sidebar",
      popular: false,
      bgColor: "bg-white",
      borderColor: "border-black",
      badge: "Most Spots"
    },
    {
      name: "Featured Card", 
      price: "$12",
      period: "14 days",
      description: "Large featured card in top deals section (1 spot total)",
      spots: "1 available",
      location: "Top deals section",
      features: [
        "Large featured card format",
        "Top deals section placement",
        "14-day active period", 
        "Professional card design",
        "High visibility above fold",
        "Analytics tracking",
        "Mobile optimized display"
      ],
      buttonText: "Get Featured Card",
      href: "/advertise/purchase?type=featured",
      popular: true,
      bgColor: "bg-white",
      borderColor: "border-black",
      badge: "Most Popular"
    },
    {
      name: "Product Showcase",
      price: "$18",
      period: "14 days",
      description: "Large product card with homepage preview (2 spots total)",
      spots: "2 available",
      location: "Homepage product showcase section",
      features: [
        "Large product showcase format",
        "Homepage/product screenshot display",
        "14-day active period",
        "Product description included",
        "Call-to-action button",
        "High engagement placement",
        "Mobile optimized showcase"
      ],
      buttonText: "Get Product Showcase",
      href: "/advertise/purchase?type=showcase",
      popular: false,
      bgColor: "bg-white",
      borderColor: "border-black",
      badge: "Best for SaaS"
    },
    {
      name: "Newsletter Sponsor",
      price: "$20",
      period: "one issue",
      description: "Premium newsletter sponsorship (1 spot per issue)",
      spots: "1 per issue",
      location: "Weekly newsletter",
      features: [
        "Featured in weekly newsletter",
        "Direct inbox access",
        "35% average open rate",
        "Subscriber engagement focus",
        "Brand story inclusion",
        "Click tracking & analytics",
        "Premium newsletter placement"
      ],
      buttonText: "Sponsor Newsletter",
      href: "/advertise/purchase?type=newsletter",
      popular: false,
      bgColor: "bg-white",
      borderColor: "border-black",
      badge: "Direct Reach"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-black text-yellow-400 px-4 py-2 text-sm font-bold">
            🚀 Pre-Launch • Founding Advertiser Spots
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight">
            Advertise on IndieSaasDeals<br/>
            <span className="text-3xl md:text-4xl">Before We Have Traffic</span>
          </h1>
          <p className="text-lg md:text-xl text-black/80 mb-4 font-medium max-w-4xl mx-auto leading-relaxed">
            Get your SaaS featured for the price of coffee. Lock in founding advertiser rates before we build our audience and prices go up 10x.
          </p>
          <p className="text-sm text-black/70 mb-4 font-medium">
            <strong>Honest Truth:</strong> We have 0 visitors right now, but these spots will be worth $100+ once we launch publicly.
          </p>
          
          {/* What You're Buying Clarification */}
          <div className="bg-white border-2 border-black rounded-xl p-6 max-w-4xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-black mb-4">📍 What You're Buying Here</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">🎯 Advertising Spots (This Page)</h4>
                <p className="text-sm text-blue-700 mb-2">Pure advertising placements on our platform:</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Sidebar cards ($7)</li>
                  <li>• Featured homepage cards ($12)</li> 
                  <li>• Product showcases ($18)</li>
                  <li>• Newsletter sponsorships ($20)</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2">🚀 Deal Submissions (Separate & FREE)</h4>
                <p className="text-sm text-green-700 mb-2">Submit your actual deals/discounts completely free:</p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• All deal submissions are FREE</li>
                  <li>• No charges for posting discounts</li>
                  <li>• Simple submission process</li>
                  <li>• <a href="/dashboard/deals/new" className="underline font-bold">Submit deals here →</a></li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-black/60 mt-4 text-center italic">
              💡 Think of it like: Advertising spots = promoting your brand • Deal submissions = offering discounts
            </p>
          </div>
          
          {/* Launch Timeline */}
          <div className="bg-white border-2 border-black rounded-xl p-6 max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <span className="font-bold">Launch Timeline:</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">January 2025 • Public Launch</div>
                <div className="text-black/60">Your ads go live when we get traffic</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Ad Spots Visualization */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-black mb-6 text-center">
            <MapPin className="w-6 h-6 inline mr-2" />
            Where Your Ads Appear
          </h3>
          
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="font-bold">Product Showcase ($18)</span>
                <span>→</span>
                <span>Large product cards with homepage preview (2 spots available)</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="font-bold">Featured Card ($12)</span>
                <span>→</span>
                <span>Large card in "Top Deals" section on homepage (1 spot available)</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="font-bold">Sidebar Spot ($7)</span>
                <span>→</span>
                <span>Small cards in each category section (5 spots available)</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="font-bold">Newsletter Sponsor ($20)</span>
                <span>→</span>
                <span>Featured in weekly newsletter (1 spot per issue)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Status Section */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-black mb-4">Current Platform Status (100% Honest)</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-black mb-1">0</div>
                <div className="text-sm text-black/70">Daily Visitors</div>
                <div className="text-xs text-black/50">Pre-launch phase</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black mb-1">0</div>
                <div className="text-sm text-black/70">Ad Impressions</div>
                <div className="text-xs text-black/50">Starting from zero</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black mb-1">$0</div>
                <div className="text-sm text-black/70">Ad Revenue Made</div>
                <div className="text-xs text-black/50">You'll be our first!</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">9</div>
                <div className="text-sm text-black/70">Total Ad Spots</div>
                <div className="text-xs text-black/50">5 sidebar + 1 featured + 2 showcase + 1 newsletter</div>
              </div>
            </div>
            <p className="text-sm text-black/60 mt-4 italic">
              "But once this launches, these spots will be 10x more expensive" - Founder
            </p>
          </div>
        </div>
      </section>

      {/* Pre-Launch Pricing */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Pre-Launch Advertiser Pricing</h2>
            <p className="text-black/70 max-w-2xl mx-auto">
              These founding advertiser prices will NEVER be available again. Once we have traffic, expect $100+ for these same spots.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={`relative ${tier.bgColor} ${tier.borderColor} border-2 rounded-2xl shadow-lg ${tier.popular ? 'scale-105 shadow-2xl ring-2 ring-green-500' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1 text-sm font-bold">
                      MOST POPULAR 🔥
                    </Badge>
                  </div>
                )}
                {tier.badge && !tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1 text-xs font-bold">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg font-bold text-black">
                      {tier.name}
                    </CardTitle>
                    {tier.spots && (
                      <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
                        {tier.spots}
                      </Badge>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">
                    {tier.price}
                    <span className="text-sm font-normal text-black/70">
                      /{tier.period}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {tier.location}
                  </div>
                  <CardDescription className="text-black/70 text-sm">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="text-green-500 text-sm mt-0.5">✓</span>
                        <span className="text-xs text-black">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full font-bold bg-black hover:bg-neutral-800 text-yellow-400 text-sm py-2"
                  >
                    <Link href={tier.href}>
                      {tier.buttonText}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise Early Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Why Advertise Before We Launch?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-black rounded-xl p-6 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-4 text-black" />
              <h3 className="font-bold text-black mb-2">Founding Advertiser Rates</h3>
              <p className="text-sm text-black/70">
                $7-18 now vs $100+ later. These spots will be 10x more expensive once we have traffic and prove our conversion rates.
              </p>
            </div>
            
            <div className="bg-white border-2 border-black rounded-xl p-6 text-center">
              <Rocket className="w-8 h-8 mx-auto mb-4 text-black" />
              <h3 className="font-bold text-black mb-2">Launch Day Exposure</h3>
              <p className="text-sm text-black/70">
                Your ads go live the moment we launch publicly. Be featured when we announce to press, social media, and launch communities.
              </p>
            </div>
            
            <div className="bg-white border-2 border-black rounded-xl p-6 text-center">
              <Gift className="w-8 h-8 mx-auto mb-4 text-black" />
              <h3 className="font-bold text-black mb-2">First Advertiser Benefits</h3>
              <p className="text-sm text-black/70">
                Get featured in our "founding advertisers" story, extended placements, and priority for future premium spots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black rounded-xl p-8">
            <h3 className="text-2xl font-bold text-black mb-4 text-center">A Message From The Founder</h3>
            <div className="text-black/80 leading-relaxed">
              <p className="mb-4">
                Look, I'll be straight with you. We have zero traffic right now. These ad spots are basically worthless today.
              </p>
              <p className="mb-4">
                But I genuinely think IndieSaasDeals is going to be huge once we launch. The site is polished, the deal hunting experience is addictive, and indie SaaS discounts are exactly what people want.
              </p>
              <p className="mb-4">
                For the price of lunch, you can lock in ad spots that will be worth $100+ in a few months. Help me make my first few advertising dollars, and you'll get incredible ROI when this thing takes off.
              </p>
              <p className="font-medium">
                Worst case: you're out $7-18. Best case: you get $100+ worth of advertising for pennies. 🚀
              </p>
              <div className="mt-6 text-sm text-black/60 text-center">
                - IndieSaasDeals Founder
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Be a Founding Advertiser?
          </h2>
          <p className="text-lg text-black/70 mb-8">
            Lock in these rates before we launch and prices increase 10x.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/advertise/purchase?type=sidebar"
              className="bg-black hover:bg-neutral-800 text-yellow-400 font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-flex items-center justify-center gap-3 shadow-lg"
            >
              Start with Sidebar - $7
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-flex items-center justify-center border-2 border-black"
            >
              Sign In to Continue
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-black/60">
            Questions? Email me directly: founder@launchboost.com
          </div>
        </div>
      </section>
    </div>
  );
}