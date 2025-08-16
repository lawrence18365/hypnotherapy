"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";

export default function PrivacyPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/sign-in');
          return;
        }
        setAuthLoading(false);
      } catch (error) {
        router.replace('/sign-in');
      }
    }
    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffd63' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffd63' }}>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">Privacy Policy</h1>
            <p className="text-lg md:text-xl text-black/80 font-medium">
              Your privacy matters to us. Here's how we protect your data.
            </p>
            <div className="mt-6">
              <span className="bg-black text-yellow-400 px-4 py-2 rounded-full font-bold text-sm">
                Last updated: July 3, 2025
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white border-2 border-black rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="prose prose-lg prose-black max-w-none">
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">1</span>
                </div>
                Information We Collect
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                We collect information you provide directly to us, such as when you create an account, 
                submit a deal, subscribe to our newsletter, or contact us. This includes your name, email address, 
                company information, and deal details.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">2</span>
                </div>
                How We Use Your Information
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, send you deal notifications, and communicate with you about 
                platform updates and new features.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">3</span>
                </div>
                Information Sharing
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share information 
                with service providers who help us operate our platform.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">4</span>
                </div>
                Data Security
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. All data is 
                encrypted in transit and at rest.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">5</span>
                </div>
                Your Rights
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                You have the right to access, update, or delete your personal information. 
                You can also opt out of marketing communications at any time. Contact us 
                to exercise these rights.
              </p>
              
              <div className="bg-yellow-50 border-2 border-black rounded-xl p-6 mt-12">
                <h3 className="text-xl font-bold text-black mb-3">Contact Us</h3>
                <p className="text-black/80 font-medium">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at{" "}
                  <a href="mailto:privacy@launchboost.com" className="text-black font-bold hover:underline">
                    privacy@launchboost.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
