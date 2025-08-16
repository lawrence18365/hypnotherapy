"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Settings, Check } from "lucide-react"
import Link from "next/link"

interface CookieSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const cookieConsent = localStorage.getItem('launchboost-cookie-consent')
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allSettings = {
      necessary: true,
      analytics: true,
      marketing: true
    }
    saveCookieSettings(allSettings)
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    saveCookieSettings(settings)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const minimalSettings = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    saveCookieSettings(minimalSettings)
    setIsVisible(false)
  }

  const saveCookieSettings = (cookieSettings: CookieSettings) => {
    localStorage.setItem('launchboost-cookie-consent', JSON.stringify({
      settings: cookieSettings,
      timestamp: new Date().toISOString()
    }))
    
    // Here you would implement actual cookie management
    // For example, load/unload analytics scripts based on consent
    console.log('Cookie settings saved:', cookieSettings)
  }

  const handleSettingChange = (key: keyof CookieSettings, value: boolean) => {
    if (key === 'necessary') return // Can't disable necessary cookies
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-black bg-white shadow-2xl">
      <div className="max-w-7xl mx-auto p-6">
        {!showSettings ? (
          // Main cookie banner
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-black mb-2">
                🍪 We use cookies to enhance your experience
              </h3>
              <p className="text-sm text-black/80 leading-relaxed">
                We use necessary cookies to make our site work. We'd also like to set optional cookies 
                to help us improve our website and analyze site usage. By clicking "Accept All", you 
                consent to our use of cookies. You can customize your preferences or reject optional cookies.{" "}
                <Link href="/privacy" className="underline hover:text-black font-medium">
                  Learn more in our Privacy Policy
                </Link>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="border-black text-black hover:bg-gray-50 font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="border-black text-black hover:bg-gray-50 font-medium"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="bg-black hover:bg-gray-800 text-yellow-400 font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          // Cookie settings panel
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">Cookie Preferences</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
            
            <div className="space-y-6 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-black mb-1">Necessary Cookies</h4>
                  <p className="text-sm text-black/70">
                    Essential for the website to function properly. These cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                    <Check className="w-3 h-3 text-yellow-400" strokeWidth={3} />
                  </div>
                  <span className="ml-2 text-sm text-black/70">Always On</span>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-black mb-1">Analytics Cookies</h4>
                  <p className="text-sm text-black/70">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div 
                    className={`w-5 h-5 border-2 border-black rounded flex items-center justify-center transition-colors ${
                      settings.analytics ? 'bg-black' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleSettingChange('analytics', !settings.analytics)}
                  >
                    {settings.analytics && (
                      <Check className="w-3 h-3 text-yellow-400" strokeWidth={3} />
                    )}
                  </div>
                </label>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-black mb-1">Marketing Cookies</h4>
                  <p className="text-sm text-black/70">
                    Used to track visitors across websites for personalized advertising.
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div 
                    className={`w-5 h-5 border-2 border-black rounded flex items-center justify-center transition-colors ${
                      settings.marketing ? 'bg-black' : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleSettingChange('marketing', !settings.marketing)}
                  >
                    {settings.marketing && (
                      <Check className="w-3 h-3 text-yellow-400" strokeWidth={3} />
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleRejectAll}
                className="border-black text-black hover:bg-gray-50 font-medium"
              >
                Reject All
              </Button>
              <Button
                onClick={handleAcceptSelected}
                className="bg-black hover:bg-gray-800 text-yellow-400 font-medium"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
