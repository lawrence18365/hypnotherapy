"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface AdvertiseSpotProps {
  size: 'banner' | 'sidebar' | 'large' | 'newsletter' | 'mobile'
  location: string
  className?: string
}

const AdSizes = {
  banner: { width: '728px', height: '90px', className: 'w-full h-[90px] max-w-[728px]' },
  sidebar: { width: '300px', height: '250px', className: 'w-[300px] h-[250px]' },
  large: { width: '320px', height: '180px', className: 'w-[320px] h-[180px]' },
  newsletter: { width: '600px', height: '120px', className: 'w-full h-[120px] max-w-[600px]' },
  mobile: { width: '320px', height: '100px', className: 'w-full h-[100px] max-w-[320px]' }
}

export function AdvertiseSpot({ size, location, className = '' }: AdvertiseSpotProps) {
  const adSize = AdSizes[size]
  
  return (
    <div className={`${adSize.className} ${className}`}>
      <Link href="/advertise" className="block w-full h-full group">
        <div className="w-full h-full bg-white border-2 border-black border-dashed rounded-lg hover:border-solid hover:bg-black hover:text-yellow-400 transition-all duration-200 flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4" />
            <span className="font-bold text-sm">ADVERTISE HERE</span>
          </div>
          <div className="text-xs opacity-80 leading-tight">
            {adSize.width} × {adSize.height}
            <br />
            {location}
          </div>
          <div className="text-xs mt-2 font-medium group-hover:text-yellow-400">
            Premium Placement Available
          </div>
        </div>
      </Link>
    </div>
  )
}

export default AdvertiseSpot
