import { Deal } from "@/lib/types"
import { DealCard } from "./deal-card"

interface DealGridProps {
  deals: Deal[]
  user?: any
  showClaimButton?: boolean
  emptyMessage?: string
}

export function DealGrid({ 
  deals, 
  user, 
  showClaimButton = true, 
  emptyMessage = "No deals found" 
}: DealGridProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground">
          Check back soon for new exclusive deals from indie founders.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* All Deals Section */}
      <div>
        <h2 className="text-xl font-bold mb-6">More Great Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              user={user}
              showClaimButton={showClaimButton}
            />
          ))}
        </div>
      </div>

      {/* Load More placeholder for future pagination */}
      {deals.length >= 9 && (
        <div className="text-center pt-8">
          <p className="text-muted-foreground text-sm">
            Showing {deals.length} deals
          </p>
        </div>
      )}
    </div>
  )
}

// Loading skeleton for the grid
export function DealGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-muted-foreground/20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted-foreground/20 rounded" />
              <div className="h-3 bg-muted-foreground/20 rounded w-5/6" />
            </div>
            <div className="flex justify-between">
              <div className="h-8 bg-muted-foreground/20 rounded w-20" />
              <div className="h-8 bg-muted-foreground/20 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
