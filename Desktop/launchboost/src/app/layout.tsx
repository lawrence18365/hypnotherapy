import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { Toaster } from "sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { CookieConsent } from "@/components/compliance/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";

export const metadata: Metadata = {
  title: "IndieSaasDeals - Premium SaaS Deals for Indie Hackers",
  description:
    "Discover exclusive early-bird deals on cutting-edge SaaS products. Help indie founders launch while saving big on the tools you need.",
  keywords: [
    "indie saas deals",
    "saas discounts",
    "indie hackers",
    "startup deals",
    "software discounts",
    "indie makers",
  ],
  authors: [{ name: "IndieSaasDeals Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },  
  openGraph: {
    title: "IndieSaasDeals - Premium SaaS Deals",
    description: "Discover exclusive early-bird deals on cutting-edge SaaS products",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "IndieSaasDeals Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IndieSaasDeals - Premium SaaS Deals",
    description: "Discover exclusive early-bird deals on cutting-edge SaaS products",
    images: ["/logo.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFDD00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <LoadingProvider showInitialLoader={true} minLoadingTime={2800}>
            <ConditionalLayout>{children}</ConditionalLayout>
          </LoadingProvider>
        </ErrorBoundary>
        <Toaster
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
        <UIToaster />
        <CookieConsent />
        <GoogleAnalytics />
        <FacebookPixel />
      </body>
    </html>
  );
}
