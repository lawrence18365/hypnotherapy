'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MainNav } from '@/components/layout/main-nav'
import { SiteFooter } from '@/components/layout/site-footer'
import { getCurrentUser } from '@/lib/client/auth'
import { type User } from '@supabase/supabase-js'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    getUser()

    // Listen for auth changes for real-time updates
    const { createClient } = require('@/lib/client/db')
    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setUser(session?.user ?? null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // For admin routes, return children without main nav/footer
  if (isAdminRoute) {
    return <>{children}</>
  }

  // For non-admin routes, return with main nav/footer
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header
        className="sticky top-0 z-50 w-full border-b border-black"
        style={{ backgroundColor: '#fbf55c' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <MainNav user={user} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  )
}
