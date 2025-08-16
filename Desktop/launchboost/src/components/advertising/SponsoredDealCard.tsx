"use client"

import { Card, CardContent } from "@/components/ui/card"

interface SponsoredDealCardProps {
  position: string
  className?: string
}

export function SponsoredDealCard({ position, className = "" }: SponsoredDealCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-2xl shadow-sm transition-all duration-300 h-full ${className}`}
    >
      <CardContent className="relative p-6 z-10 flex flex-col items-center justify-center text-center h-full">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            📢
          </div>
          <h3 className="text-lg font-bold text-gray-700">Your SaaS Here</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Be one of our first advertisers before we have traffic
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
            <div className="text-xs text-green-700 font-semibold">{position}</div>
            <div className="text-sm font-bold text-green-800">$12 for 14 days</div>
            <div className="text-xs text-green-600">Pre-launch pricing</div>
          </div>
          <button className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded px-3 py-1 hover:bg-gray-50 transition-colors">
            Get This Spot
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SponsoredDealCard