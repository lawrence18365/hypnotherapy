export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  is_founder: boolean
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  founder_id: string
  product_name: string
  product_website: string
  slug: string
  title: string
  description: string
  short_description: string
  category: 'AI & Machine Learning' | 'Analytics & Data' | 'Business & Finance' | 'Communication & Collaboration' | 'Design & Creative' | 'Developer Tools' | 'E-commerce & Retail' | 'Education & Learning' | 'Healthcare & Wellness' | 'HR & Recruiting' | 'Marketing & Growth' | 'Productivity & Organization' | 'Sales & CRM' | 'Security & Privacy' | 'Social & Community'
  original_price: number
  deal_price: number
  discount_percentage: number
  total_codes: number
  expires_at: string
  tags: string[]
  is_featured: boolean
  status: 'draft' | 'pending_review' | 'live' | 'paused' | 'expired' | 'rejected'
  created_at: string
  updated_at: string
  
  // Calculated fields
  codes_total?: number
  codes_claimed?: number
  views_count?: number
  avg_rating?: number
  review_count?: number
  
  // Relations
  founder?: User
  feedback?: Feedback[]
  deal_codes?: DealCode[]
}

export interface DealCode {
  id: string
  deal_id: string
  code: string
  is_claimed: boolean
  claimed_by_user_id?: string
  claimed_at?: string
  created_at: string
  
  // Relations
  deal?: Deal
  claimed_by?: User
}

export interface Feedback {
  id: string
  deal_id: string
  user_id: string
  content: string
  rating: number
  screenshot_url?: string
  created_at: string
  
  // Relations
  deal?: Deal
  user?: User
}

// Form types
export interface DealFormData {
  product_name: string
  product_url: string
  tagline: string
  description: string
  category: Deal['category']
  discount_percentage: number
  logo_url?: string
  is_featured: boolean
  discount_codes: string[]
}

export interface FeedbackFormData {
  content: string
  rating: number
  screenshot?: File
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// Dashboard stats
export interface DashboardStats {
  total_deals: number
  active_deals: number
  total_views: number
  total_claims: number
  recent_feedback: Feedback[]
}

// Filter types
export interface DealFilters {
  category?: Deal['category']
  is_featured?: boolean
  status?: Deal['status']
  search?: string
}
