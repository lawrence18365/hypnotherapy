"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";
import { Metadata } from "next";
import Link from "next/link";
import { 
  Zap, 
  BarChart3, 
  Building2, 
  MessageSquare, 
  Paintbrush, 
  Code, 
  ShoppingCart, 
  GraduationCap, 
  Heart, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  Handshake, 
  Shield, 
  Globe 
} from 'lucide-react';

// Remove metadata export since this is now a client component
// export const metadata: Metadata = {
//   title: "Browse Categories - LaunchBoost",
//   description: "Discover SaaS deals organized by category. Find the perfect tools for your business needs.",
// };

interface Category {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'ai-machine-learning',
    name: 'AI & Machine Learning',
    icon: Zap,
    description: 'Cutting-edge AI tools and machine learning platforms to automate and enhance your workflows.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'analytics-data',
    name: 'Analytics & Data',
    icon: BarChart3,
    description: 'Powerful analytics tools and data platforms to gain insights and make data-driven decisions.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'business-finance',
    name: 'Business & Finance',
    icon: Building2,
    description: 'Financial management, accounting, and business operation tools for growing companies.',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'communication-collaboration',
    name: 'Communication & Collaboration',
    icon: MessageSquare,
    description: 'Team communication, video conferencing, and collaboration platforms.',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'design-creative',
    name: 'Design & Creative',
    icon: Paintbrush,
    description: 'Design tools, creative software, and visual content creation platforms.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    icon: Code,
    description: 'Development environments, APIs, deployment tools, and developer productivity software.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'ecommerce-retail',
    name: 'E-commerce & Retail',
    icon: ShoppingCart,
    description: 'Online store platforms, inventory management, and retail optimization tools.',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    icon: GraduationCap,
    description: 'Learning management systems, online course platforms, and educational tools.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'healthcare-wellness',
    name: 'Healthcare & Wellness',
    icon: Heart,
    description: 'Health tracking, wellness apps, and healthcare management platforms.',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'hr-recruiting',
    name: 'HR & Recruiting',
    icon: Users,
    description: 'Human resources, recruitment platforms, and employee management tools.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'marketing-growth',
    name: 'Marketing & Growth',
    icon: TrendingUp,
    description: 'Marketing automation, growth hacking tools, and customer acquisition platforms.',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'productivity-organization',
    name: 'Productivity & Organization',
    icon: CheckSquare,
    description: 'Task management, note-taking, and productivity enhancement tools.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'sales-crm',
    name: 'Sales & CRM',
    icon: Handshake,
    description: 'Customer relationship management, sales automation, and pipeline tools.',
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    icon: Shield,
    description: 'Cybersecurity tools, privacy protection, and data security platforms.',
    color: 'from-slate-500 to-slate-600'
  },
  {
    id: 'social-community',
    name: 'Social & Community',
    icon: Globe,
    description: 'Community building, social media management, and engagement platforms.',
    color: 'from-sky-500 to-sky-600'
  }
];

export default function CategoriesPage() {
  // Categories should be publicly accessible - no authentication required

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Browse by Category
          </h1>
          <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto leading-relaxed mb-8">
            Discover the perfect SaaS tools for your specific needs.
            <span className="font-bold text-black"> Premium deals</span> across 
            <span className="font-bold text-black">{categories.length} categories</span> waiting for you.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-black/70 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Early-bird pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Lifetime deals available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Exclusive discounts</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="group block"
              >
                <div className="bg-white border-2 border-black rounded-2xl h-full p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="bg-gradient-to-r bg-black/5 border border-black/10 text-black/60 text-xs font-medium px-3 py-1 rounded-full">
                      Explore
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-black group-hover:text-black/80 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-black/70 font-medium leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Action Arrow */}
                  <div className="mt-6 flex items-center text-black font-bold group-hover:text-black/80">
                    <span>Explore deals</span>
                    <svg 
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-black mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-black/80 font-medium mb-8">
              Submit your own deal or suggest a category we should add.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/deals/new" 
                className="bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 px-8 rounded-full transition-colors duration-200 inline-flex items-center justify-center"
              >
                Submit a Deal
              </Link>
              <Link 
                href="/feedback" 
                className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-8 rounded-full border-2 border-black transition-colors duration-200 inline-flex items-center justify-center"
              >
                Request Category
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
