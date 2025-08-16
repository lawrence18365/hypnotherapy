"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

const adSpotConfigs = {
  sidebar: {
    name: "Sidebar Spot",
    price: "$7",
    period: "7 days", 
    description: "Small sponsor card in category sections (5 spots total)",
    features: [
      "Shows in 5 category sections",
      "Small sponsor card format", 
      "7-day active period",
      "Click tracking included",
      "Mobile responsive placement"
    ]
  },
  featured: {
    name: "Featured Card",
    price: "$12", 
    period: "14 days",
    description: "Large featured card in top deals section (1 spot total)",
    features: [
      "Large featured card format",
      "Top deals section placement", 
      "14-day active period",
      "Professional card design",
      "High visibility above fold"
    ]
  },
  banner: {
    name: "Banner Placement",
    price: "$15",
    period: "7 days", 
    description: "Medium banner between sections (3 spots total)",
    features: [
      "Medium-sized banner format",
      "Strategic placement between sections",
      "7-day active period", 
      "High visibility on all pages",
      "Brand-focused design"
    ]
  },
  newsletter: {
    name: "Newsletter Sponsor",
    price: "$20",
    period: "one issue",
    description: "Premium newsletter sponsorship (1 spot per issue)", 
    features: [
      "Featured in weekly newsletter",
      "Direct inbox access",
      "35% average open rate",
      "Brand story inclusion",
      "Click tracking and analytics"
    ]
  }
}

export default function PurchasePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const adType = searchParams.get('type') as keyof typeof adSpotConfigs
  const config = adSpotConfigs[adType]
  
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    websiteUrl: ""
  })
  
  useEffect(() => {
    if (!config) {
      router.push('/advertise')
    }
  }, [config, router])
  
  if (!config) {
    return null
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('/api/advertise/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adType,
          email: formData.email,
          companyName: formData.companyName,
          websiteUrl: formData.websiteUrl
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
      
    } catch (error) {
      console.error('Purchase error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            href="/advertise"
            className="inline-flex items-center gap-2 text-black/70 hover:text-black mb-8 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Advertising Options
          </Link>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="bg-white border-2 border-black rounded-2xl h-fit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-black">{config.name}</h3>
                  <Badge className="bg-black text-yellow-400">{config.price}</Badge>
                </div>
                
                <p className="text-sm text-gray-600">{config.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-black">What's Included:</h4>
                  <ul className="space-y-1">
                    {config.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-black">{config.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Duration: {config.period}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Form */}
            <Card className="bg-white border-2 border-black rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">Purchase Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-black">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 border-2 border-gray-300 focus:border-black"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="text-sm font-medium text-black">Company Name</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="mt-1 border-2 border-gray-300 focus:border-black"
                      placeholder="Your Company Inc."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-black">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                      className="mt-1 border-2 border-gray-300 focus:border-black"
                      placeholder="https://yoursite.com"
                    />
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-gray-800 text-yellow-400 font-bold py-3 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Creating Checkout...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay {config.price} with Stripe
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment processing by Stripe. Your card details are never stored on our servers.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
