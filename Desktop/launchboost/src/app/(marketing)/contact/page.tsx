"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/client/auth";
import { Mail, MessageSquare, Users, DollarSign } from "lucide-react"

export default function ContactPage() {
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
  const contactOptions = [
    {
      title: "General Inquiries",
      description: "Questions about LaunchBoost or need help getting started?",
      email: "hello@launchboost.com",
      icon: MessageSquare,
      bgColor: "bg-white"
    },
    {
      title: "Advertise with Us",
      description: "Want to feature your deal or explore partnership opportunities?",
      email: "advertise@launchboost.com",
      icon: DollarSign,
      bgColor: "bg-black"
    },
    {
      title: "Customer Support",
      description: "Need help with your account, deal submission, or payments?",
      email: "support@launchboost.com",
      icon: Users,
      bgColor: "bg-white"
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffd63' }}>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">Get in Touch</h1>
            <p className="text-lg md:text-xl text-black/80 font-medium max-w-3xl mx-auto">
              Have questions? Need support? Want to partner with us? 
              We're here to help you succeed with LaunchBoost.
            </p>
          </div>
          
          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactOptions.map((option, index) => {
              const IconComponent = option.icon
              return (
                <div 
                  key={index} 
                  className={`${option.bgColor} border-2 border-black rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-16 h-16 ${
                    option.bgColor === 'bg-black' ? 'bg-yellow-400' : 'bg-black'
                  } rounded-xl flex items-center justify-center mb-6`}>
                    <IconComponent className={`h-8 w-8 ${
                      option.bgColor === 'bg-black' ? 'text-black' : 'text-yellow-400'
                    }`} />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-4 ${
                    option.bgColor === 'bg-black' ? 'text-yellow-400' : 'text-black'
                  }`}>
                    {option.title}
                  </h3>
                  
                  <p className={`font-medium mb-6 leading-relaxed ${
                    option.bgColor === 'bg-black' ? 'text-white/80' : 'text-black/80'
                  }`}>
                    {option.description}
                  </p>
                  
                  <a 
                    href={`mailto:${option.email}`}
                    className={`inline-flex items-center gap-2 font-bold py-3 px-6 rounded-full transition-colors duration-200 ${
                      option.bgColor === 'bg-black' 
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-black' 
                        : 'bg-black hover:bg-gray-800 text-yellow-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    {option.email}
                  </a>
                </div>
              )
            })}
          </div>
          
          {/* FAQ Section */}
          <div className="bg-white border-2 border-black rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 text-center">Quick Answers</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-black mb-3">How do I submit a deal?</h3>
                <p className="text-black/80 font-medium mb-6">
                  Sign up for free, go to your dashboard, and click "Submit Deal". 
                  Our review process typically takes 24-48 hours.
                </p>
                
                <h3 className="text-xl font-bold text-black mb-3">What makes a good deal?</h3>
                <p className="text-black/80 font-medium">
                  Legitimate discounts (20%+ off), clear value proposition, 
                  and sufficient discount codes for our community.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-black mb-3">How does pricing work?</h3>
                <p className="text-black/80 font-medium mb-6">
                  Free listings are always available. Featured placement costs $19.99 
                  for 15 days, Premium costs $39.99 for 30 days.
                </p>
                
                <h3 className="text-xl font-bold text-black mb-3">Can I get a refund?</h3>
                <p className="text-black/80 font-medium">
                  Yes, if your deal is rejected during review. Once approved 
                  and live, payments are non-refundable.
                </p>
              </div>
            </div>
          </div>
          
          {/* Response Time */}
          <div className="text-center mt-12">
            <div className="bg-black text-yellow-400 px-6 py-4 rounded-2xl inline-block">
              <p className="font-bold">
                📞 We typically respond within 4 hours during business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
