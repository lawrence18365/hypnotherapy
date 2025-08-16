"use client";

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, DollarSign, Zap, TrendingUp, Target, Code, Brain, Palette, Clock } from "lucide-react"
import Link from "next/link"

interface CategoryConfig {
  headline: string;
  subtext: string;
  socialProof: string;
  cta: string;
  browseCta: string;
  bgGradient: string;
  accentColor: string;
  targetAudience: string;
  keyMetrics: string[];
  icon: any;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  marketing: {
    headline: "Stop Wasting Budget on Tools That Don't Convert",
    subtext: "Exclusive deals on attribution, analytics & growth tools designed for marketing teams who need real ROI",
    socialProof: "Built for Marketing Teams",
    cta: "Find Tools That Drive ROI",
    browseCta: "Browse Marketing Deals",
    bgGradient: "from-blue-50 to-purple-50",
    accentColor: "text-blue-600",
    targetAudience: "Marketing Managers & Growth Teams",
    keyMetrics: ["Quality over quantity deals", "ROI-focused selection", "Easy integrations"],
    icon: Target
  },
  development: {
    headline: "Ship Faster with Tools That Actually Work",
    subtext: "DevOps, APIs & deployment tools at startup prices - no enterprise markup or vendor lock-in",
    socialProof: "Built for Developers",
    cta: "Build Better for Less",
    browseCta: "Browse Developer Tools",
    bgGradient: "from-green-50 to-blue-50",
    accentColor: "text-green-600", 
    targetAudience: "Developers & DevOps Teams",
    keyMetrics: ["Developer-first selection", "Startup-friendly pricing", "No vendor lock-in"],
    icon: Code
  },
  ai: {
    headline: "Automate the Boring Stuff, Focus on Strategy",
    subtext: "AI tools designed to save time without enterprise complexity or steep learning curves",
    socialProof: "Built for Productivity",
    cta: "Automate Your Workflow",
    browseCta: "Browse AI Tools",
    bgGradient: "from-purple-50 to-pink-50",
    accentColor: "text-purple-600",
    targetAudience: "Operations & Strategy Teams", 
    keyMetrics: ["Quick setup process", "No coding required", "Focus on results"],
    icon: Brain
  },
  design: {
    headline: "Create Like a Pro Without Pro Prices",
    subtext: "Design tools, assets & collaboration platforms for growing teams who need professional results",
    socialProof: "Built for Creatives",
    cta: "Design Better for Less",
    browseCta: "Browse Design Tools",
    bgGradient: "from-pink-50 to-orange-50",
    accentColor: "text-pink-600",
    targetAudience: "Designers & Creative Teams",
    keyMetrics: ["Professional quality tools", "Team collaboration focus", "Brand consistency"],
    icon: Palette
  },
  productivity: {
    headline: "Get More Done Without Burning Out",
    subtext: "Productivity tools that actually make your team more efficient instead of adding more complexity",
    socialProof: "Built for Efficiency",
    cta: "Work Smarter, Not Harder", 
    browseCta: "Browse Productivity Tools",
    bgGradient: "from-yellow-50 to-orange-50",
    accentColor: "text-orange-600",
    targetAudience: "Teams & Business Owners",
    keyMetrics: ["Simplicity focused", "Easy team adoption", "Workflow optimization"],
    icon: Clock
  }
};

// Default Deal Hunter Hero (fallback)
const DefaultDealHunterHero = ({ totalSavings, activeDeals, isLoggedIn }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-4 leading-tight max-w-4xl mx-auto">
        Unique Exclusive
        <br />
        SaaS Discounts
      </h1>
      
      <p className="text-lg md:text-xl text-black/80 mb-8 max-w-3xl mx-auto font-medium">
        Be among the first to discover exclusive discounts on indie SaaS tools. Real deals, real savings, founding member access.
      </p>
      
      {/* Community Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-gray-200 rounded-lg p-4 mb-8 inline-block">
        <div className="flex items-center justify-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-lg font-bold text-black">{Math.round(totalSavings / 1000)}K+</div>
              <div className="text-xs text-gray-600">Community Saved</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-lg font-bold text-black">{activeDeals}</div>
              <div className="text-xs text-gray-600">Active Deals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic Category Hero Component
export const CategoryAwareHero = ({ category = '', totalSavings = 0, activeDeals = 0, isLoggedIn = false }) => {
  const config = categoryConfigs[category];
  
  // If no specific category, use default deal hunter messaging
  if (!config) {
    return <DefaultDealHunterHero totalSavings={totalSavings} activeDeals={activeDeals} isLoggedIn={isLoggedIn} />;
  }
  
  const IconComponent = config.icon;
  
  return (
    <div className={`bg-gradient-to-br ${config.bgGradient} border-2 border-gray-200 rounded-2xl p-8 mb-8`}>
      <div className="text-center">
        <div className="mb-4">
          <Badge className={`${config.accentColor} bg-white border-2 border-current px-4 py-2 font-bold`}>
            <IconComponent className="w-4 h-4 mr-2" />
            {config.targetAudience}
          </Badge>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-black mb-4 leading-tight">
          {config.headline}
        </h1>
        
        <p className="text-lg md:text-xl text-black/80 mb-6 max-w-3xl mx-auto font-medium">
          {config.subtext}
        </p>
        
        {/* Category-Specific Metrics */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {config.keyMetrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-black">{metric}</span>
            </div>
          ))}
        </div>
        
        {/* Social Proof with Category Context */}
        <div className="bg-white/90 border-2 border-black rounded-lg p-4 mb-6 inline-block">
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Users className={`w-5 h-5 ${config.accentColor}`} />
              <div>
                <div className="text-lg font-bold text-black">{config.socialProof}</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${config.accentColor}`} />
              <div>
                <div className="text-lg font-bold text-black">${Math.round(totalSavings / 1000)}K+</div>
                <div className="text-xs text-gray-600">Category Savings</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category-Specific CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href={isLoggedIn ? `/categories/${category}` : "/sign-in"}
            className="bg-black hover:bg-gray-800 text-yellow-400 px-8 py-3 rounded-lg font-bold transition-colors duration-200 flex items-center gap-2"
          >
            <IconComponent className="w-5 h-5" />
            {config.cta}
          </Link>
          
          <Link
            href={`/deals?category=${category}&sort=discount`}
            className="bg-white hover:bg-gray-100 text-black border-2 border-black px-8 py-3 rounded-lg font-bold transition-colors duration-200 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            {config.browseCta}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryAwareHero;