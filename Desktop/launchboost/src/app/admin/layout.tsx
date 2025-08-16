import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/server/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin authentication using proper profile-based auth
  const { user, profile } = await requireAdmin()
  
  console.log('Admin Layout: User authenticated:', user.email, 'Role:', profile.role)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffd63' }}>
      <div className="bg-black border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-yellow-400">
                🛡️ LaunchBoost Admin
              </h1>
              <nav className="hidden md:flex space-x-6">
                <a
                  href="/admin/deals/pending"
                  className="text-yellow-400 hover:text-white px-3 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Pending Deals
                </a>
                <a
                  href="/admin/deals/approved"
                  className="text-yellow-400 hover:text-white px-3 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Live Deals
                </a>
                <a
                  href="/admin/analytics"
                  className="text-yellow-400 hover:text-white px-3 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400 font-bold text-sm">
                {profile.full_name || user.email} ({profile.role})
              </span>
              <a
                href="/dashboard"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full text-sm transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}