import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCurrentUserServer } from "@/lib/server/auth"
import { TicketView } from "@/components/tickets/ticket-view"
import { TicketComments } from "@/components/tickets/ticket-comments"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

async function getTicket(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
}

export default async function TicketPage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUserServer();
  const ticketData = await getTicket(params.slug);

  if (!ticketData || !ticketData.ticket) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Ticket Details */}
        <Suspense fallback={<TicketSkeleton />}>
          <TicketView 
            ticket={ticketData.ticket} 
            hasUpvoted={ticketData.hasUpvoted}
            user={user} 
          />
        </Suspense>

        {/* Comments Section */}
        <Suspense fallback={<CommentsSkeleton />}>
          <TicketComments 
            ticketSlug={params.slug}
            comments={ticketData.comments}
            user={user} 
          />
        </Suspense>
      </div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

function CommentsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ticketData = await getTicket(params.slug);
  
  if (!ticketData || !ticketData.ticket) {
    return {
      title: 'Ticket Not Found',
    };
  }

  return {
    title: `${ticketData.ticket.title} | LaunchBoost Feature Requests`,
    description: ticketData.ticket.description.substring(0, 160),
  };
}