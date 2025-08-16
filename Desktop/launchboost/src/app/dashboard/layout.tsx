import React from 'react';
import { getCurrentUser } from '@/lib/server/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated using real Supabase auth
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <>
      {children}
    </>
  );
}
