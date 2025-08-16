// Main layout - no auth required for homepage
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is for the main homepage and public routes
  // No authentication required here
  return <>{children}</>;
}