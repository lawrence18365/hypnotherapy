"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";
import { Target, Users, TrendingUp, Heart, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  // About page should be publicly accessible - no authentication required
  
  const stats = [
    { number: "Pre-Launch", label: "Building Community" },
    { number: "Founding", label: "Member Access" },
    { number: "Real", label: "Deals Only" },
    { number: "Zero", label: "Fake Metrics" }
  ]
  const values = [
    {
      icon: Target,
      title: "Founder-First",
      description: "Built by founders, for founders. We understand the challenges of launching and growing a SaaS business."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our curated community of early adopters and builders creates genuine connections between founders and users."
    },
    {
      icon: TrendingUp,
      title: "Results Focused",
      description: "We measure success by the real customers and revenue our founders generate, not vanity metrics."
    }
  ]

  

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffd63' }}>
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight">
            We're Building the Future
            <br />
            <span className="text-black">of SaaS Discovery</span>
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium max-w-4xl mx-auto leading-relaxed mb-12">
            LaunchBoost is more than a marketplace – we're a community of builders helping 
            each other succeed. Every deal tells a story of innovation, hustle, and the 
            relentless pursuit of solving real problems.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-black/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-black rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 text-center">Our Story</h2>
            
            <div className="prose prose-lg prose-black max-w-none">
              <p className="text-black/80 font-medium leading-relaxed mb-6">
                LaunchBoost was born from a simple frustration: as founders, we were tired of 
                shouting into the void on social media, begging for upvotes on aggregator sites, 
                and hoping our products would somehow find their audience.
              </p>
              
              <p className="text-black/80 font-medium leading-relaxed mb-6">
                We realized that the SaaS community needed a better way to connect. Not through 
                vanity metrics or anonymous views, but through genuine value exchange – founders 
                offering real discounts to early adopters who actually need their solutions.
              </p>
              
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                Today, LaunchBoost has become the trusted platform where founders launch with 
                confidence and builders discover their next essential tool. Every deal represents 
                a founder's dream and a customer's success story.
              </p>
              
              <div className="bg-yellow-50 border-2 border-black rounded-xl p-6">
                <p className="text-black font-bold text-lg mb-2">
                  "We believe every founder deserves a fair shot at success, and every builder 
                  deserves access to the best tools at great prices."
                </p>
                <p className="text-black/70 font-medium">– The LaunchBoost Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-16">What Drives Us</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div key={index} className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="h-8 w-8 text-yellow-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black mb-4">{value.title}</h3>
                  <p className="text-black/80 font-medium leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black border-2 border-black rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="h-10 w-10 text-black" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6">Our Mission</h2>
            <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed mb-8">
              To democratize SaaS discovery by creating meaningful connections between 
              innovative founders and the builders who need their solutions. We're building 
              a world where great products find their perfect customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/advertise" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-flex items-center justify-center">
                Join as a Founder
              </Link>
              <Link href="/deals" className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 inline-flex items-center justify-center">
                Discover Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Ready to Join Our Community?</h2>
          <p className="text-lg md:text-xl text-black/80 font-medium mb-12 leading-relaxed">
            Whether you're a founder looking to launch your next big thing or a builder 
            searching for your next essential tool, LaunchBoost is your home.
          </p>
          
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">For Founders</h3>
                <p className="text-black/80 font-medium mb-4">
                  Launch your product with confidence and connect with early adopters who will become your biggest advocates.
                </p>
                <Link href="/advertise" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
                  Start Launching
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">For Builders</h3>
                <p className="text-black/80 font-medium mb-4">
                  Discover cutting-edge tools before everyone else and get exclusive discounts from innovative founders.
                </p>
                <Link href="/deals" className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-6 rounded-full transition-colors duration-200 inline-flex items-center">
                  Browse Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
