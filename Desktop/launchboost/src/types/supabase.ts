export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          twitter_handle: string | null
          linkedin_url: string | null
          is_founder: boolean
          is_verified: boolean
          role: 'user' | 'founder' | 'admin' | 'super_admin'
          company_name: string | null
          company_website: string | null
          company_description: string | null
          company_logo_url: string | null
          founder_verification_status: string
          email_notifications: boolean
          marketing_emails: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          is_founder?: boolean
          is_verified?: boolean
          role?: 'user' | 'founder' | 'admin' | 'super_admin'
          company_name?: string | null
          company_website?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          founder_verification_status?: string
          email_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          is_founder?: boolean
          is_verified?: boolean
          role?: 'user' | 'founder' | 'admin' | 'super_admin'
          company_name?: string | null
          company_website?: string | null
          company_description?: string | null
          company_logo_url?: string | null
          founder_verification_status?: string
          email_notifications?: boolean
          marketing_emails?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          founder_id: string
          title: string
          slug: string
          description: string
          short_description: string | null
          category: 'AI & Machine Learning' | 'Analytics & Data' | 'Business & Finance' | 'Communication & Collaboration' | 'Design & Creative' | 'Developer Tools' | 'E-commerce & Retail' | 'Education & Learning' | 'Healthcare & Wellness' | 'HR & Recruiting' | 'Marketing & Growth' | 'Productivity & Organization' | 'Sales & CRM' | 'Security & Privacy' | 'Social & Community'
          tags: string[]
          product_name: string
          product_website: string
          product_logo_url: string | null
          product_screenshots: string[]
          original_price: number
          deal_price: number
          discount_percentage: number
          total_codes: number
          codes_remaining: number | null
          deal_type: string
          starts_at: string
          expires_at: string | null
          status: 'draft' | 'pending_review' | 'live' | 'paused' | 'expired' | 'rejected'
          is_featured: boolean
          is_verified: boolean
          featured_until: string | null
          views_count: number
          clicks_count: number
          conversions_count: number
          admin_notes: string | null
          rejection_reason: string | null
          pricing_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          title: string
          slug: string
          description: string
          short_description?: string | null
          category: 'AI & Machine Learning' | 'Analytics & Data' | 'Business & Finance' | 'Communication & Collaboration' | 'Design & Creative' | 'Developer Tools' | 'E-commerce & Retail' | 'Education & Learning' | 'Healthcare & Wellness' | 'HR & Recruiting' | 'Marketing & Growth' | 'Productivity & Organization' | 'Sales & CRM' | 'Security & Privacy' | 'Social & Community'
          tags?: string[]
          product_name: string
          product_website: string
          product_logo_url?: string | null
          product_screenshots?: string[]
          original_price: number
          deal_price: number
          total_codes?: number
          deal_type?: string
          starts_at?: string
          expires_at?: string | null
          status?: 'draft' | 'pending_review' | 'live' | 'paused' | 'expired' | 'rejected'
          is_featured?: boolean
          is_verified?: boolean
          featured_until?: string | null
          views_count?: number
          clicks_count?: number
          conversions_count?: number
          admin_notes?: string | null
          rejection_reason?: string | null
          pricing_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          title?: string
          slug?: string
          description?: string
          short_description?: string | null
          category?: 'AI & Machine Learning' | 'Analytics & Data' | 'Business & Finance' | 'Communication & Collaboration' | 'Design & Creative' | 'Developer Tools' | 'E-commerce & Retail' | 'Education & Learning' | 'Healthcare & Wellness' | 'HR & Recruiting' | 'Marketing & Growth' | 'Productivity & Organization' | 'Sales & CRM' | 'Security & Privacy' | 'Social & Community'
          tags?: string[]
          product_name?: string
          product_website?: string
          product_logo_url?: string | null
          product_screenshots?: string[]
          original_price?: number
          deal_price?: number
          total_codes?: number
          deal_type?: string
          starts_at?: string
          expires_at?: string | null
          status?: 'draft' | 'pending_review' | 'live' | 'paused' | 'expired' | 'rejected'
          is_featured?: boolean
          is_verified?: boolean
          featured_until?: string | null
          views_count?: number
          clicks_count?: number
          conversions_count?: number
          admin_notes?: string | null
          rejection_reason?: string | null
          pricing_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      deal_codes: {
        Row: {
          id: string
          deal_id: string
          user_id: string | null
          code: string
          is_claimed: boolean
          claimed_at: string | null
          used_at: string | null
          used_successfully: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          user_id?: string | null
          code: string
          is_claimed?: boolean
          claimed_at?: string | null
          used_at?: string | null
          used_successfully?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          user_id?: string | null
          code?: string
          is_claimed?: boolean
          claimed_at?: string | null
          used_at?: string | null
          used_successfully?: boolean | null
          created_at?: string
        }
      }
      deal_reviews: {
        Row: {
          id: string
          deal_id: string
          user_id: string
          rating: number
          review_text: string | null
          is_verified_purchase: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          user_id: string
          rating: number
          review_text?: string | null
          is_verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          user_id?: string
          rating?: number
          review_text?: string | null
          is_verified_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      deal_stats: {
        Row: {
          id: string
          founder_id: string
          title: string
          slug: string
          description: string
          short_description: string | null
          category: string
          tags: string[]
          product_name: string
          product_website: string
          product_logo_url: string | null
          product_screenshots: string[]
          original_price: number
          deal_price: number
          discount_percentage: number
          total_codes: number
          codes_remaining: number | null
          deal_type: string
          starts_at: string
          expires_at: string | null
          status: string
          is_featured: boolean
          is_verified: boolean
          featured_until: string | null
          views_count: number
          clicks_count: number
          conversions_count: number
          admin_notes: string | null
          rejection_reason: string | null
          pricing_tier: string
          created_at: string
          updated_at: string
          avg_rating: number
          review_count: number
          founder_name: string | null
          company_name: string | null
          founder_avatar: string | null
        }
      }
    }
    Functions: {
      generate_deal_codes: {
        Args: {
          deal_id: string
          code_count: number
        }
        Returns: void
      }
      make_user_admin: {
        Args: {
          user_email: string
        }
        Returns: void
      }
    }
    Enums: {
      deal_status: 'draft' | 'pending_review' | 'live' | 'paused' | 'expired' | 'rejected'
      deal_category: 'AI & Machine Learning' | 'Analytics & Data' | 'Business & Finance' | 'Communication & Collaboration' | 'Design & Creative' | 'Developer Tools' | 'E-commerce & Retail' | 'Education & Learning' | 'Healthcare & Wellness' | 'HR & Recruiting' | 'Marketing & Growth' | 'Productivity & Organization' | 'Sales & CRM' | 'Security & Privacy' | 'Social & Community'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
      notification_type: 'deal_approved' | 'deal_rejected' | 'deal_expires_soon' | 'new_follower' | 'system_update'
      user_role: 'user' | 'founder' | 'admin' | 'super_admin'
    }
  }
}
