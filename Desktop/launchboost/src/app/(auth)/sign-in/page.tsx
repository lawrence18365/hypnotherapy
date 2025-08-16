"use client"

import { UserAuthForm } from "@/components/auth/user-auth-form"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/client/auth"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          // User is already logged in, redirect to dashboard
          router.replace('/dashboard')
        }
      } catch (error) {
        // User is not logged in, stay on sign-in page
        console.log('User not authenticated, staying on sign-in page')
      }
    }
    
    checkAuth()
  }, [router])
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-8">
              <div className="bg-black rounded-2xl p-4 inline-block shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Logo width={40} height={40} showText={false} priority={true} />
              </div>
            </Link>
            
            <h1 className="text-3xl font-bold text-black mb-3">
              Welcome to LaunchBoost
            </h1>
            <p className="text-black/70 font-medium leading-relaxed">
              Join the community discovering exclusive SaaS deals from indie founders
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-black p-8 mb-8">
            <UserAuthForm />
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm font-medium">
              <Link 
                href="/advertise" 
                className="text-black/70 hover:text-black transition-colors duration-200 hover:underline"
              >
                For Founders
              </Link>
              <div className="w-1 h-1 bg-black/30 rounded-full" />
              <Link 
                href="/privacy" 
                className="text-black/70 hover:text-black transition-colors duration-200 hover:underline"
              >
                Privacy
              </Link>
              <div className="w-1 h-1 bg-black/30 rounded-full" />
              <Link 
                href="/terms" 
                className="text-black/70 hover:text-black transition-colors duration-200 hover:underline"
              >
                Terms
              </Link>
            </div>
            
            <p className="text-xs text-black/60 leading-relaxed max-w-xs mx-auto">
              By signing in, you&apos;re joining a curated community of early adopters and innovative founders.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
