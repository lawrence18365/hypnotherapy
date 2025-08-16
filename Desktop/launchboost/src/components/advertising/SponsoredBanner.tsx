"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Crown, Eye, Star, Megaphone } from "lucide-react"

interface SponsoredBannerProps {
  position: string
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function SponsoredBanner({ position, className = "", size = 'medium' }: SponsoredBannerProps) {
  const sizeClasses = {
    small: "h-16 text-sm",
    medium: "h-24 text-base", 
    large: "h-32 text-lg"
  }
  
  const priceBySize = {
    small: "$5",
    medium: "$15", 
    large: "$25"
  }
  
  return (
    <Link href="/advertise" className="block group">
      <div
        className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-lg ${sizeClasses[size]} hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden ${className}`}
      >
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>

        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900">
                Your Brand Here
              </h4>
              <p className="text-sm text-blue-700">Reach deal hunters when they're most engaged</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-blue-200 text-blue-800 px-3 py-1 mb-2">
              📢 {position}
            </Badge>
            <div className="text-sm font-bold text-blue-900">
              {priceBySize[size]} • 7 days
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default SponsoredBanner