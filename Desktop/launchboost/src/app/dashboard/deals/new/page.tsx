"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StagedImageUpload, StagedImageUploadRef } from '@/components/ui/staged/staged-image-upload';

// --- Helper Data & Components ---

// Categories that match the database enum EXACTLY
const categories = [
  { value: "AI & Machine Learning", label: "AI & Machine Learning" },
  { value: "Analytics & Data", label: "Analytics & Data" },
  { value: "Business & Finance", label: "Business & Finance" },
  { value: "Communication & Collaboration", label: "Communication & Collaboration" },
  { value: "Design & Creative", label: "Design & Creative" },
  { value: "Developer Tools", label: "Developer Tools" },
  { value: "E-commerce & Retail", label: "E-commerce & Retail" },
  { value: "Education & Learning", label: "Education & Learning" },
  { value: "Healthcare & Wellness", label: "Healthcare & Wellness" },
  { value: "HR & Recruiting", label: "HR & Recruiting" },
  { value: "Marketing & Growth", label: "Marketing & Growth" },
  { value: "Productivity & Organization", label: "Productivity & Organization" },
  { value: "Sales & CRM", label: "Sales & CRM" },
  { value: "Security & Privacy", label: "Security & Privacy" },
  { value: "Social & Community", label: "Social & Community" },
];

// --- SVG Icons (Replacement for lucide-react) ---
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 9 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

// --- Reusable UI Components (Self-Contained) ---
const Card = ({ children, className = '' }) => <div className={`border-2 border-black bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-xl ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>{children}</p>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950";
  const variants = {
    default: "bg-black text-yellow-400 hover:bg-neutral-800",
    outline: "border-2 border-black bg-transparent text-black hover:bg-black hover:text-yellow-400",
    ghost: "hover:bg-black/5 text-black",
  };
  const sizes = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3" };
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  return <button className={classes} {...props}>{children}</button>;
};

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input className={`flex h-10 w-full rounded-md border-2 border-black dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-gray-950 ${className}`} ref={ref} {...props} />
));
Input.displayName = 'Input';


const Label = ({ children, ...props }) => <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>{children}</label>;

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border-2 border-black dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-gray-950 ${className}`} ref={ref} {...props} />
));
Textarea.displayName = 'Textarea';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: "border-transparent bg-black text-yellow-400",
        secondary: "border-2 border-black bg-white text-black",
    }
    return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>{children}</div>
}

// --- Main Component ---
export default function NewDealPage() {
  const [formData, setFormData] = useState({
    productName: '', productWebsite: '', title: '', description: '',
    shortDescription: '', category: '', originalPrice: '', dealPrice: '',
    totalCodes: '100', expiresAt: '', tags: [], pricingTier: 'free', iconUrl: '',
    codeType: 'universal', universalCode: '', redemptionInstructions: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'submitting', 'success'
  const [step, setStep] = useState(1); // Start at step 1 (product info) - no pricing selection
  const [hasStagedFile, setHasStagedFile] = useState(false); // Track if image is staged for upload
  const imageUploadRef = useRef<StagedImageUploadRef>(null);
  const [uniqueCodesFile, setUniqueCodesFile] = useState<File | null>(null);
  const [parsedCodes, setParsedCodes] = useState<string[]>([]);
  const [codeFileError, setCodeFileError] = useState<string>('');
  const [selectedAdvertising, setSelectedAdvertising] = useState<string | null>(null);
  const [advertisingPaymentStatus, setAdvertisingPaymentStatus] = useState<string | null>(null);

  // File parsing for unique codes
  const parseCodesFile = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const codes = text
            .split(/[\r\n,;\t]+/)
            .map(code => code.trim())
            .filter(code => code.length > 0)
            .filter(code => /^[A-Za-z0-9-_]{3,50}$/.test(code)); // Basic validation
          
          // Remove duplicates
          const uniqueCodes = [...new Set(codes)];
          resolve(uniqueCodes);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleCodesFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUniqueCodesFile(null);
      setParsedCodes([]);
      setCodeFileError('');
      return;
    }

    // Validate file type
    const allowedTypes = ['text/plain', 'text/csv', 'application/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv)$/i)) {
      setCodeFileError('Please upload a .txt or .csv file');
      setUniqueCodesFile(null);
      setParsedCodes([]);
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setCodeFileError('File size must be less than 1MB');
      setUniqueCodesFile(null);
      setParsedCodes([]);
      return;
    }

    try {
      setCodeFileError('');
      const codes = await parseCodesFile(file);
      
      if (codes.length === 0) {
        setCodeFileError('No valid codes found in file. Codes must be 3-50 characters, alphanumeric with dashes/underscores only.');
        setUniqueCodesFile(null);
        setParsedCodes([]);
        return;
      }

      if (codes.length > 10000) {
        setCodeFileError('Too many codes. Maximum 10,000 codes allowed.');
        setUniqueCodesFile(null);
        setParsedCodes([]);
        return;
      }

      setUniqueCodesFile(file);
      setParsedCodes(codes);
      // Update total codes to match parsed codes
      updateFormData('totalCodes', codes.length.toString());
    } catch (error) {
      setCodeFileError('Failed to parse file. Please check the format.');
      setUniqueCodesFile(null);
      setParsedCodes([]);
    }
  };

  // Payment verification state
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentTier, setPaymentTier] = useState(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState(true);

  // Check for payment confirmation on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    
    if (payment === 'success' && sessionId && tier) {
      setPaymentStatus('completed');
      setPaymentTier(tier);
      setShowPaymentSelection(false);
      // Update form data with the paid tier
      updateFormData('pricingTier', tier === 'featured' ? 'featured' : 'pro');
    } else {
      setShowPaymentSelection(true);
    }
  }, []);

  // Handle payment initiation
  const handlePaymentSelection = async (tier) => {
    if (!formData.productName.trim()) {
      alert('Please enter your product name first');
      return;
    }
    
    try {
      const response = await fetch('/api/payments/listing-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tier,
          productName: formData.productName
        })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData('tags', [...formData.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.originalPrice);
    const deal = parseFloat(formData.dealPrice);
    if (original > 0 && deal >= 0 && deal < original) {
      return Math.round(((original - deal) / original) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate discount codes before submission
    if (formData.codeType === 'universal') {
      if (!formData.universalCode.trim()) {
        alert('Please enter a universal discount code.');
        return;
      }
      if (!/^[A-Za-z0-9-_]{3,50}$/.test(formData.universalCode)) {
        alert('Universal code must be 3-50 characters, letters, numbers, dashes and underscores only.');
        return;
      }
    } else if (formData.codeType === 'unique') {
      if (!uniqueCodesFile || parsedCodes.length === 0) {
        alert('Please upload a valid codes file with at least one code.');
        return;
      }
    }
    
    setSubmissionStatus('submitting');
    
    try {
      // Step 1: Upload image if one is staged
      let finalIconUrl = formData.iconUrl;
      
      if (hasStagedFile && imageUploadRef.current) {
        const uploadedUrl = await imageUploadRef.current.uploadToCloud();
        if (uploadedUrl) {
          finalIconUrl = uploadedUrl;
        } else {
          console.error('Image upload failed but form submission was continued.');
          setSubmissionStatus(null);
          alert('Failed to upload image. Please try again.');
          return;
        }
      } else if (hasStagedFile && !imageUploadRef.current) {
        // This case indicates a logic error, as the ref should now persist
        console.error('File was staged but ref is null. This should not happen. Check component structure.');
        setSubmissionStatus(null);
        alert('A critical error occurred with the image uploader. Please refresh and try again.');
        return;
      }
      
      // Step 2: Submit deal with the potentially updated image URL
      const dealData = {
        ...formData,
        iconUrl: finalIconUrl,
        // Include discount code data
        discountCodes: formData.codeType === 'universal' 
          ? { type: 'universal', code: formData.universalCode.trim() }
          : { type: 'unique', codes: parsedCodes },
        redemptionInstructions: formData.redemptionInstructions.trim() || null,
        // Include advertising selection
        selectedAdvertising: selectedAdvertising || null
      };
      
      const response = await fetch('/api/deals/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmissionStatus('success');
        console.log('Deal submitted successfully:', result.deal);
        // Reset form to prevent any lingering state issues
        setFormData({
          productName: '', productWebsite: '', title: '', description: '',
          shortDescription: '', category: '', originalPrice: '', dealPrice: '',
          totalCodes: '100', expiresAt: '', tags: [], pricingTier: 'free', iconUrl: '',
          codeType: 'universal', universalCode: '', redemptionInstructions: ''
        });
        setHasStagedFile(false);
        setUniqueCodesFile(null);
        setParsedCodes([]);
        setCodeFileError('');
        setSelectedAdvertising(null);
        setAdvertisingPaymentStatus(null);
        // Also clear the uploader component state via its ref method
        imageUploadRef.current?.clearFile();
        setStep(1);
      } else {
        console.error('Error submitting deal:', result.error);
        setSubmissionStatus(null);
        alert('Error submitting deal: ' + result.error);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmissionStatus(null);
      alert('Network error. Please try again.');
    }
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  if (submissionStatus === 'success') {
      return (
          <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf55c' }}>
            <div className="max-w-2xl mx-auto px-6 text-center">
              <div className="bg-white border-2 border-black rounded-2xl p-12 shadow-lg">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-black mb-6">Deal Submitted Successfully!</h1>
                <p className="text-black/80 font-medium mb-8 leading-relaxed">
                  Your deal has been submitted for review. We'll notify you via email once it's approved and live on LaunchBoost.
                </p>
                <div className="space-y-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-black hover:bg-gray-800 text-[#fbf55c] font-bold py-4 px-8 rounded-full transition-colors duration-200 w-full"
                  >
                    Submit Another Deal
                  </button>
                  <Link 
                    href="/dashboard"
                    className="block bg-white hover:bg-gray-100 text-black font-bold py-4 px-8 rounded-full border-2 border-black transition-colors duration-200"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
      )
  }

  // Show payment selection screen if payment hasn't been completed
  if (showPaymentSelection) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
        <div className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">Choose Your Listing Tier</h1>
              <p className="text-lg md:text-xl text-black/80 font-medium mb-8">
                All deal submissions require upfront payment. Choose your tier to get started.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              {/* Product Name Input */}
              <div className="bg-white border-2 border-black rounded-2xl p-8 mb-8">
                <h3 className="text-xl font-bold text-black mb-4">First, tell us your product name:</h3>
                <Input
                  placeholder="Enter your product name (required for payment)"
                  value={formData.productName}
                  onChange={(e) => updateFormData('productName', e.target.value)}
                  className="mb-4"
                />
              </div>
              
              {/* Pricing Tiers */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Featured Tier */}
                <div className="bg-white border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-all">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-black mb-2">Featured Listing</h3>
                    <div className="text-4xl font-bold text-black mb-2">$19.99</div>
                    <p className="text-black/70">Enhanced visibility and priority positioning</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Featured placement on homepage</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Enhanced visibility for 15 days</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Priority positioning in category</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => handlePaymentSelection('featured')}
                    className="w-full"
                    disabled={!formData.productName.trim()}
                  >
                    <DollarSignIcon />
                    Select Featured - $19.99
                  </Button>
                </div>
                
                {/* Premium Tier */}
                <div className="bg-white border-2 border-black rounded-2xl p-8 hover:shadow-lg transition-all relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-black text-yellow-400 px-4 py-2">MOST POPULAR</Badge>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-black mb-2">Premium Listing</h3>
                    <div className="text-4xl font-bold text-black mb-2">$39.99</div>
                    <p className="text-black/70">Maximum exposure and promotional support</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Top placement on all pages</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Social media promotion</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Personal review and feedback</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircleIcon className="text-green-500" />
                      <span>Extended featuring for 30 days</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => handlePaymentSelection('premium')}
                    className="w-full"
                    disabled={!formData.productName.trim()}
                  >
                    <ZapIcon />
                    Select Premium - $39.99
                  </Button>
                </div>
              </div>
              
              {!formData.productName.trim() && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircleIcon className="text-yellow-600" />
                    <p className="text-yellow-800 font-medium">
                      Please enter your product name above before selecting a payment tier.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf55c' }}>
      <div className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-black/80 hover:text-black font-medium transition-colors mb-6">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
                Submit New Deal ({paymentTier ? `${paymentTier.toUpperCase()} PAID` : 'PAID'})
              </h1>
              <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-6 inline-block">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="text-green-600" />
                  <p className="text-green-800 font-bold">
                    Payment completed! Your {paymentTier || 'premium'} listing is confirmed.
                  </p>
                </div>
              </div>
              <p className="text-lg md:text-xl text-black/80 font-medium">
                Share your SaaS discount with our community - completely free!
              </p>
              {formData.category && !categories.find(cat => cat.value === formData.category) && (
                <div className="mt-6 p-4 bg-red-100 border-2 border-red-400 rounded-xl">
                  <p className="text-red-800 font-medium">
                    ⚠️ Invalid category detected. Please{' '}
                    <button 
                      onClick={() => window.location.reload()} 
                      className="underline font-bold"
                    >
                      refresh this page
                    </button>{' '}
                    or reselect your category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-16">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className="flex items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${
                      step >= stepNumber 
                        ? 'bg-black text-yellow-400' 
                        : 'bg-white border-2 border-black text-black'
                    }`}>
                      {step > stepNumber ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                  </div>
                  {stepNumber < 4 && (
                    <div className={`h-2 w-16 rounded-full ${
                      step > stepNumber ? 'bg-black' : 'bg-white border border-black'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">


            {/* STEP 1: Product Information */}
            <div style={{ display: step === 1 ? 'block' : 'none' }} className="border bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><LightbulbIcon /> <span>Product Information</span></h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about your SaaS product.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input 
                      id="productName" 
                      placeholder="e.g., TaskFlow Pro" 
                      value={formData.productName} 
                      onChange={(e) => updateFormData('productName', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productWebsite">Product Website *</Label>
                    <Input 
                      id="productWebsite" 
                      type="url" 
                      placeholder="https://your-product.com" 
                      value={formData.productWebsite} 
                      onChange={(e) => updateFormData('productWebsite', e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select 
                    id="category" 
                    value={formData.category} 
                    onChange={(e) => updateFormData('category', e.target.value)} 
                    required 
                    className="flex h-10 w-full items-center justify-between rounded-md border-2 border-black dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., 50% off TaskFlow Pro - Limited Time" 
                    value={formData.title} 
                    onChange={(e) => updateFormData('title', e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea 
                    id="shortDescription" 
                    placeholder="Brief description for deal cards (max 150 characters)" 
                    value={formData.shortDescription} 
                    onChange={(e) => updateFormData('shortDescription', e.target.value)} 
                    maxLength={150} 
                    rows={3} 
                    required 
                  />
                  <p className="text-xs text-gray-500">{formData.shortDescription.length}/150 characters</p>
                </div>
                
                <div className="space-y-2">
                  <StagedImageUpload
                    ref={imageUploadRef}
                    onFileSelect={(file) => setHasStagedFile(file !== null)}
                    folder="deal-icons"
                    label="Product Icon/Logo (Optional)"
                    description="Select your product icon or logo (PNG, JPEG, WebP, GIF - max 5MB)"
                    className=""
                  />
                  <p className="text-xs text-gray-500">
                    💡 Tip: A clear, simple icon works best. Square format (1:1 ratio) recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2: Deal Details */}
            <div style={{ display: step === 2 ? 'block' : 'none' }} className="border bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><DollarSignIcon /> <span>Deal Details</span></h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set your pricing and deal terms.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($) *</Label>
                    <Input 
                      id="originalPrice" 
                      type="number" 
                      placeholder="99.00" 
                      value={formData.originalPrice} 
                      onChange={(e) => updateFormData('originalPrice', e.target.value)} 
                      required 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealPrice">Deal Price ($) *</Label>
                    <Input 
                      id="dealPrice" 
                      type="number" 
                      placeholder="49.00" 
                      value={formData.dealPrice} 
                      onChange={(e) => updateFormData('dealPrice', e.target.value)} 
                      required 
                      min="0" 
                      step="0.01" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-gray-100 dark:bg-gray-800">
                      <Badge variant="secondary" className="font-bold text-lg">{calculateDiscount()}% OFF</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalCodes">Number of Codes *</Label>
                    <Input 
                      id="totalCodes" 
                      type="number" 
                      placeholder="100" 
                      value={formData.totalCodes} 
                      onChange={(e) => updateFormData('totalCodes', e.target.value)} 
                      required 
                      min="1" 
                    />
                    <p className="text-xs text-gray-500">How many codes to generate for this deal?</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Deal Expiration *</Label>
                    <div className="relative">
                      <CalendarIcon />
                      <Input 
                        id="expiresAt" 
                        type="date" 
                        className="pl-9" 
                        value={formData.expiresAt} 
                        onChange={(e) => updateFormData('expiresAt', e.target.value)} 
                        required 
                        min={new Date().toISOString().split('T')[0]} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Description & Tags */}
            <div style={{ display: step === 3 ? 'block' : 'none' }} className="border bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2"><TagIcon /> <span>Description & Tags</span></h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Help users discover your deal.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your product, what makes it special..." 
                    value={formData.description} 
                    onChange={(e) => updateFormData('description', e.target.value)} 
                    rows={6} 
                    required 
                  />
                  <p className="text-xs text-gray-500">Be detailed! This helps users understand your value.</p>
                </div>
                <div className="space-y-2">
                  <Label>Tags (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a tag and press Enter" 
                      value={currentTag} 
                      onChange={(e) => setCurrentTag(e.target.value)} 
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); 
                          addTag();
                        }
                      }} 
                    />
                    <Button type="button" onClick={addTag} size="sm">Add</Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        >
                          {tag} &times;
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: Discount Codes */}
            <div style={{ display: step === 4 ? 'block' : 'none' }} className="border bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm rounded-xl">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="8"></circle><path d="M14.31 8l5.74 9.94"></path><path d="M9.69 8h11.48"></path><path d="M7.38 12l5.74-9.94"></path><path d="M9.69 16L3.95 6.06"></path><path d="M14.31 16H2.83"></path><path d="M16.62 12l-5.74 9.94"></path></svg>
                  <span>Discount Codes</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Provide the actual discount codes for your product.</p>
              </div>
              <div className="p-6 pt-0 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Important: Provide YOUR Discount Codes</h4>
                  <p className="text-sm text-yellow-700">
                    These should be the actual discount codes that work on your website. Users will get these codes to claim your deal.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base font-medium">How do you want to provide discount codes? *</Label>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Universal Code Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.codeType === 'universal' 
                          ? 'border-black bg-yellow-50' 
                          : 'border-gray-200 hover:border-black'
                      }`}
                      onClick={() => {
                        updateFormData('codeType', 'universal');
                        setUniqueCodesFile(null);
                        setParsedCodes([]);
                        setCodeFileError('');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                          formData.codeType === 'universal' 
                            ? 'border-black bg-black' 
                            : 'border-gray-300'
                        }`}>
                          {formData.codeType === 'universal' && (
                            <div className="w-full h-full rounded-full bg-yellow-400 transform scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Universal Code</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            One code that all users get (e.g., "LAUNCH50")
                          </p>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Simple to manage<br/>
                            ✓ Works for unlimited use codes<br/>
                            ✓ Perfect for percentage discounts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unique Codes Option */}
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.codeType === 'unique' 
                          ? 'border-black bg-yellow-50' 
                          : 'border-gray-200 hover:border-black'
                      }`}
                      onClick={() => {
                        updateFormData('codeType', 'unique');
                        updateFormData('universalCode', '');
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                          formData.codeType === 'unique' 
                            ? 'border-black bg-black' 
                            : 'border-gray-300'
                        }`}>
                          {formData.codeType === 'unique' && (
                            <div className="w-full h-full rounded-full bg-yellow-400 transform scale-50"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Unique Codes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Upload file with many different codes
                          </p>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ✓ Each user gets different code<br/>
                            ✓ Perfect for limited-use codes<br/>
                            ✓ Better tracking per user
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Universal Code Input */}
                {formData.codeType === 'universal' && (
                  <div className="space-y-2">
                    <Label htmlFor="universalCode">Your Discount Code *</Label>
                    <Input 
                      id="universalCode"
                      placeholder="e.g., LAUNCH50, EARLYBIRD, SAVE25"
                      value={formData.universalCode}
                      onChange={(e) => updateFormData('universalCode', e.target.value)}
                      required
                      pattern="^[A-Za-z0-9-_]{3,50}$"
                      title="Code must be 3-50 characters, letters, numbers, dashes and underscores only"
                    />
                    <p className="text-xs text-gray-500">
                      This exact code will be given to all users who claim your deal.
                    </p>
                  </div>
                )}

                {/* Unique Codes File Upload */}
                {formData.codeType === 'unique' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="codesFile">Upload Codes File *</Label>
                      <input
                        id="codesFile"
                        type="file"
                        accept=".txt,.csv"
                        onChange={handleCodesFileUpload}
                        className="flex h-10 w-full rounded-md border-2 border-black dark:border-gray-700 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Supported formats:</strong> .txt, .csv files</p>
                        <p><strong>Format:</strong> One code per line (e.g., CODE1, CODE2, CODE3)</p>
                        <p><strong>Requirements:</strong> 3-50 characters, letters/numbers/dashes/underscores only</p>
                        <p><strong>Limits:</strong> Maximum 10,000 codes, file size under 1MB</p>
                      </div>
                    </div>

                    {codeFileError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{codeFileError}</p>
                      </div>
                    )}

                    {parsedCodes.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">✅ File Processed Successfully</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p><strong>Valid codes found:</strong> {parsedCodes.length}</p>
                          <p><strong>Example codes:</strong> {parsedCodes.slice(0, 3).join(', ')}{parsedCodes.length > 3 ? '...' : ''}</p>
                          <p className="text-xs mt-2">Your total codes count has been updated to match the uploaded file.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="redemptionInstructions">Redemption Instructions (Optional)</Label>
                  <Textarea
                    id="redemptionInstructions"
                    placeholder="e.g., 'Apply this code at checkout on our website to get your discount' or 'Use this code when signing up for our Pro plan'"
                    value={formData.redemptionInstructions}
                    onChange={(e) => updateFormData('redemptionInstructions', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Help users understand how to use their discount code (optional but recommended).
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertCircleIcon />
                    <span>Deal Summary</span>
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Product:</strong> {formData.productName || '...'}</p>
                    <p><strong>Discount:</strong> {calculateDiscount()}% off (${formData.dealPrice || '0'} instead of ${formData.originalPrice || '0'})</p>
                    <p><strong>Code Type:</strong> {formData.codeType === 'universal' ? 'Universal Code' : 'Unique Codes'}</p>
                    {formData.codeType === 'universal' && formData.universalCode && (
                      <p><strong>Code:</strong> {formData.universalCode}</p>
                    )}
                    {formData.codeType === 'unique' && parsedCodes.length > 0 && (
                      <p><strong>Codes Available:</strong> {parsedCodes.length} unique codes</p>
                    )}
                    <p><strong>Expires:</strong> {formData.expiresAt || '...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTIONAL ADVERTISING UPSELL */}
            {step === 4 && (
              <div className="bg-white border-2 border-black rounded-xl shadow-lg">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-black mb-3">🚀 Boost Your Visibility</h4>
                    <p className="text-black/80 font-medium mb-4">
                      Your deal submission is <span className="font-bold text-black">completely FREE!</span><br/>
                      Add optional advertising to get more eyes on your deal.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {/* Sidebar Spot */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedAdvertising === 'sidebar' 
                          ? 'border-black bg-yellow-400 text-black' 
                          : 'border-black bg-white text-black hover:bg-gray-50'
                      }`} 
                      onClick={() => setSelectedAdvertising(selectedAdvertising === 'sidebar' ? null : 'sidebar')}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">$7</div>
                        <div className="text-sm font-bold mb-2">Sidebar Spot</div>
                        <div className="text-xs font-medium mb-3">7 days • Category sections</div>
                        <div className="text-xs mb-3">Small sponsor cards in category areas</div>
                        {selectedAdvertising === 'sidebar' && (
                          <div className="bg-black text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">SELECTED</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Featured Card */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg relative ${
                        selectedAdvertising === 'featured' 
                          ? 'border-black bg-yellow-400 text-black' 
                          : 'border-black bg-white text-black hover:bg-gray-50'
                      }`} 
                      onClick={() => setSelectedAdvertising(selectedAdvertising === 'featured' ? null : 'featured')}
                    >
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-black text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
                      </div>
                      <div className="text-center pt-2">
                        <div className="text-2xl font-bold mb-1">$12</div>
                        <div className="text-sm font-bold mb-2">Featured Card</div>
                        <div className="text-xs font-medium mb-3">14 days • Top deals section</div>
                        <div className="text-xs mb-3">Large card in featured area</div>
                        {selectedAdvertising === 'featured' && (
                          <div className="bg-black text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">SELECTED</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Banner Placement */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedAdvertising === 'banner' 
                          ? 'border-black bg-yellow-400 text-black' 
                          : 'border-black bg-white text-black hover:bg-gray-50'
                      }`} 
                      onClick={() => setSelectedAdvertising(selectedAdvertising === 'banner' ? null : 'banner')}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">$18</div>
                        <div className="text-sm font-bold mb-2">Banner Placement</div>
                        <div className="text-xs font-medium mb-3">30 days • Sticky top bar</div>
                        <div className="text-xs mb-3">Always visible banner position</div>
                        {selectedAdvertising === 'banner' && (
                          <div className="bg-black text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">SELECTED</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Premium Package */}
                    <div 
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedAdvertising === 'premium' 
                          ? 'border-black bg-yellow-400 text-black' 
                          : 'border-black bg-white text-black hover:bg-gray-50'
                      }`} 
                      onClick={() => setSelectedAdvertising(selectedAdvertising === 'premium' ? null : 'premium')}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">$20</div>
                        <div className="text-sm font-bold mb-2">Premium Package</div>
                        <div className="text-xs font-medium mb-3">30 days • All placements</div>
                        <div className="text-xs mb-3">Maximum visibility everywhere</div>
                        {selectedAdvertising === 'premium' && (
                          <div className="bg-black text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">SELECTED</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedAdvertising && (
                    <div className="bg-black border-2 border-black rounded-xl p-4 mb-6">
                      <div className="text-center">
                        <h5 className="font-bold text-yellow-400 mb-2">
                          ⚡ {selectedAdvertising.charAt(0).toUpperCase() + selectedAdvertising.slice(1)} Advertising Selected
                        </h5>
                        <p className="text-yellow-400/80 text-sm">
                          We'll email you a payment link after your deal is approved.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center rounded-xl p-4" style={{ backgroundColor: '#fbf55c' }}>
                    <p className="text-sm font-bold text-black mb-3">
                      ✓ Deal submission is FREE • ✓ Advertising is optional • ✓ No upfront payment required
                    </p>
                    <button 
                      type="button"
                      onClick={() => setSelectedAdvertising(null)}
                      className="text-sm text-black/70 hover:text-black font-bold underline"
                    >
                      Continue without advertising →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                )}
              </div>
              <div>
                {step < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submissionStatus === 'submitting'}>
                    {submissionStatus === 'submitting' ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ZapIcon />
                        {selectedAdvertising 
                          ? `Submit Deal + ${selectedAdvertising.charAt(0).toUpperCase() + selectedAdvertising.slice(1)} Ad`
                          : 'Submit Deal (FREE)'
                        }
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}