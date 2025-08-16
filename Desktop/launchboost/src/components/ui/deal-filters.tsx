"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, SortAsc, SortDesc, Clock, TrendingUp, Star, DollarSign } from "lucide-react"
import Link from "next/link"

interface DealFiltersProps {
  currentCategory?: string
  currentSort?: string
  onFilterChange?: (filters: any) => void
}

export function DealFilters({ currentCategory, currentSort, onFilterChange }: DealFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  
  const quickFilters = [
    { id: "high-discount", label: "💰 50%+ Off", value: "discount_gte_50" },
    { id: "new-launch", label: "🆕 Launched This Week", value: "new_launch" },
    { id: "ending-soon", label: "⏰ Ending Soon", value: "ending_soon" },
    { id: "lifetime", label: "♾️ Lifetime Deals", value: "lifetime_deal" },
    { id: "popular", label: "🔥 Most Popular", value: "popular" },
    { id: "verified", label: "✅ Verified Deals", value: "verified" }
  ]
  
  const sortOptions = [
    { label: "🔥 Newest Launches", value: "newest" },
    { label: "💰 Best Discounts", value: "discount_desc" },
    { label: "⏰ Ending Soon", value: "ending_soon" },
    { label: "⭐ Most Popular", value: "popular" },
    { label: "💵 Price: Low to High", value: "price_asc" },
    { label: "💸 Price: High to Low", value: "price_desc" }
  ]
  
  const dealTypes = [
    { label: "🚀 Launch Special", value: "launch_special", color: "bg-purple-100 text-purple-700" },
    { label: "♾️ Lifetime Deal", value: "lifetime", color: "bg-blue-100 text-blue-700" },
    { label: "📅 Monthly Discount", value: "monthly", color: "bg-green-100 text-green-700" },
    { label: "🎯 Bundle Offer", value: "bundle", color: "bg-orange-100 text-orange-700" }
  ]
  
  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
  }
  
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Deal Discovery Filters</h3>
          <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
        </div>
      </div>
      
      {/* Sort Options */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🎯 Sort by
        </label>
        <Select defaultValue={currentSort || "newest"}>
          <SelectTrigger className="w-full md:w-64 border-2 border-gray-300 rounded-xl">
            <SelectValue placeholder="Choose sorting..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Quick Filters */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          ⚡ Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilters.includes(filter.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.id)}
              className={`rounded-full font-medium px-4 py-2 transition-all duration-200 ${
                activeFilters.includes(filter.id)
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                  : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Deal Types */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          🏷️ Deal Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dealTypes.map(type => (
            <div
              key={type.value}
              className={`${type.color} rounded-xl p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-current`}
            >
              <div className="font-semibold text-sm">
                {type.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="border-t-2 border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilters([])}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filterId => {
              const filter = quickFilters.find(f => f.id === filterId)
              return filter ? (
                <Badge
                  key={filterId}
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => toggleFilter(filterId)}
                >
                  {filter.label} ×
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
      
      {/* Stats Display */}
      <div className="mt-6 pt-4 border-t-2 border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
            <div className="text-lg font-bold text-green-700">72%</div>
            <div className="text-xs text-green-600">Avg. Discount</div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
            <div className="text-lg font-bold text-blue-700">{Math.floor(Math.random() * 50) + 20}</div>
            <div className="text-xs text-blue-600">New This Week</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
            <div className="text-lg font-bold text-orange-700">{Math.floor(Math.random() * 15) + 5}</div>
            <div className="text-xs text-orange-600">Ending Today</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
            <div className="text-lg font-bold text-purple-700">4.8⭐</div>
            <div className="text-xs text-purple-600">Avg. Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}
