"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Crown, Eye, Star } from "lucide-react"

interface SponsoredQuickDealProps {
  position: string
  className?: string
}

export function SponsoredQuickDeal({ position, className = "" }: SponsoredQuickDealProps) {
  return (
    <Link href="/advertise" className="block group">
      <div
        className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer relative ${className}`}
      >
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        <div className="space-y-3">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-700 text-sm">
              Your SaaS Here
            </h4>
            <Badge className="bg-gray-200 text-gray-600 text-xs px-2 py-1">
              📢 Sponsor
            </Badge>
          </div>

          {/* Pricing Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-700">Your Price</span>
            </div>
            <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
              Your Deal
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>⭐ Your rating</span>
            <span className="font-semibold text-green-600">Your saving</span>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">
                {position}
              </span>
              <div className="text-xs text-green-600 font-semibold">
                $7 for 7 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default SponsoredQuickDeal