import Link from "next/link"
import { Mail, Twitter, Github, Heart } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-black" style={{ backgroundColor: '#fbf55c' }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo width={220} height={220} showText={false} textSize="2xl" />
            <p className="text-black/80 font-medium leading-relaxed">
              The premier marketplace for discovering exclusive SaaS deals and supporting indie founders.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://twitter.com/ezysyntax" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-yellow-400 hover:bg-gray-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link 
                href="https://github.com/launchboost" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-yellow-400 hover:bg-gray-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="mailto:hello@launchboost.com" 
                className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-yellow-400 hover:bg-gray-800 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-black mb-6">For Users</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-black/80 hover:text-black font-medium transition-colors">
                  Browse Deals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-black/80 hover:text-black font-medium transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-black/80 hover:text-black font-medium transition-colors">
                  All Deals
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-black/80 hover:text-black font-medium transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-black mb-6">For Founders</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/advertise" className="text-black/80 hover:text-black font-medium transition-colors">
                  Why LaunchBoost
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-black/80 hover:text-black font-medium transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard/deals/new" className="text-black/80 hover:text-black font-medium transition-colors">
                  Submit Deal
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-black/80 hover:text-black font-medium transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-black mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-black/80 hover:text-black font-medium transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-black/80 hover:text-black font-medium transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-black/80 hover:text-black font-medium transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-black/80 hover:text-black font-medium transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t-2 border-black/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-black/80 font-medium mb-4 sm:mb-0">
            © 2025 LaunchBoost. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-black/80 font-medium">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by founders, for founders</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
