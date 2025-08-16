"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";

export default function TermsPage() {
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
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">Terms of Service</h1>
            <p className="text-lg md:text-xl text-black/80 font-medium">
              The rules that keep our platform fair and safe for everyone.
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
                Acceptance of Terms
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                By accessing and using LaunchBoost, you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to abide by the terms, 
                please do not use this service.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">2</span>
                </div>
                Use License
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                Permission is granted to access LaunchBoost for personal and commercial use 
                related to discovering and promoting SaaS deals. This license does not include 
                the right to resell, redistribute, or create derivative works.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">3</span>
                </div>
                Deal Submissions
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                Users may submit deals subject to our review and approval process. We reserve the right 
                to reject or remove any deal at our discretion. All submitted deals must offer genuine 
                value and legitimate discounts to our community.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">4</span>
                </div>
                User Conduct
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                Users agree not to use the service for any unlawful purpose, to submit false or 
                misleading information, to spam or harass other users, or to attempt to circumvent 
                our security measures. Violations may result in account suspension or termination.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">5</span>
                </div>
                Payment Terms
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                Featured and premium listings require upfront payment. All payments are processed 
                securely through Stripe. Refunds may be provided at our discretion for deals that 
                are rejected during our review process.
              </p>
              
              <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold">6</span>
                </div>
                Limitation of Liability
              </h2>
              <p className="text-black/80 font-medium leading-relaxed mb-8">
                LaunchBoost is provided "as is" without warranties of any kind. We are not liable 
                for any damages arising from your use of the service, including lost profits, 
                data loss, or business interruption.
              </p>
              
              <div className="bg-yellow-50 border-2 border-black rounded-xl p-6 mt-12">
                <h3 className="text-xl font-bold text-black mb-3">Contact Information</h3>
                <p className="text-black/80 font-medium">
                  If you have any questions about these Terms of Service or need legal clarification, 
                  please contact us at{" "}
                  <a href="mailto:legal@launchboost.com" className="text-black font-bold hover:underline">
                    legal@launchboost.com
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
