-- LaunchBoost SaaS Platform - Complete Database Schema
-- This file contains the complete SQL schema for the entire LaunchBoost platform
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE deal_status AS ENUM ('draft', 'pending_review', 'live', 'paused', 'expired', 'rejected');
CREATE TYPE deal_category AS ENUM (
  'AI & Machine Learning',
  'Analytics & Data',
  'Business & Finance',
  'Communication & Collaboration',
  'Design & Creative',
  'Developer Tools',
  'E-commerce & Retail',
  'Education & Learning',
  'Healthcare & Wellness',
  'HR & Recruiting',
  'Marketing & Growth',
  'Productivity & Organization',
  'Sales & CRM',
  'Security & Privacy',
  'Social & Community'
);
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'trialing');
CREATE TYPE notification_type AS ENUM ('deal_approved', 'deal_rejected', 'deal_expires_soon', 'new_follower', 'system_update');
CREATE TYPE user_role AS ENUM ('user', 'founder', 'admin', 'super_admin');

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  is_founder BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'user',
  
  -- Founder-specific fields
  company_name TEXT,
  company_website TEXT,
  company_description TEXT,
  company_logo_url TEXT,
  founder_verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites
CREATE TABLE user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deal_id UUID, -- Will reference deals table
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

-- User follows (founders following each other)
CREATE TABLE user_follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- ============================================================================
-- DEALS & PRODUCTS
-- ============================================================================

-- Deals table (core of the platform)
CREATE TABLE deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  founder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic deal info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category deal_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Product info
  product_name TEXT NOT NULL,
  product_website TEXT NOT NULL,
  product_logo_url TEXT,
  product_screenshots TEXT[] DEFAULT '{}',
  
  -- Deal specifics
  original_price INTEGER NOT NULL, -- in cents
  deal_price INTEGER NOT NULL, -- in cents
  discount_percentage INTEGER GENERATED ALWAYS AS (
    ROUND(((original_price - deal_price) * 100.0 / original_price)::numeric, 0)::integer
  ) STORED,
  
  -- Deal mechanics
  total_codes INTEGER NOT NULL DEFAULT 100,
  codes_remaining INTEGER,
  deal_type TEXT DEFAULT 'discount', -- discount, free_trial, lifetime, etc.
  
  -- Timing
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Status and features
  status deal_status DEFAULT 'draft',
  pricing_tier TEXT DEFAULT 'free' CHECK (pricing_tier IN ('free', 'featured', 'pro')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  
  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  
  -- Admin notes
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK(deal_price < original_price),
  CHECK(total_codes > 0),
  CHECK(starts_at < expires_at)
);

-- Deal codes (individual discount codes)
CREATE TABLE deal_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who claimed it
  
  code TEXT NOT NULL UNIQUE,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  
  -- Usage tracking
  used_at TIMESTAMPTZ,
  used_successfully BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK((is_claimed = FALSE AND user_id IS NULL AND claimed_at IS NULL) OR 
        (is_claimed = TRUE AND user_id IS NOT NULL AND claimed_at IS NOT NULL))
);

-- Deal reviews and ratings
CREATE TABLE deal_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Verification
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(deal_id, user_id)
);

-- ============================================================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================================================

-- Customer data (Stripe integration)
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents
  stripe_price_id TEXT UNIQUE NOT NULL,
  billing_period TEXT NOT NULL, -- month, year
  features TEXT[] DEFAULT '{}',
  max_deals INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  customer_id UUID REFERENCES customers(id),
  
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status subscription_status NOT NULL,
  
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

-- Deal analytics (daily aggregated data)
CREATE TABLE deal_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  codes_claimed INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(deal_id, date)
);

-- User activity tracking
CREATE TABLE user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  activity_type TEXT NOT NULL, -- page_view, deal_click, code_claim, etc.
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================================================

-- System notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website', -- homepage_modal, footer, etc.
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  
  -- Preferences
  email_frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
  interested_categories TEXT[] DEFAULT '{}',
  
  -- Tracking
  last_opened_at TIMESTAMPTZ,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General feedback submissions (now public tickets)
CREATE TABLE feedback_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Ticket details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('feature_request', 'improvement', 'bug_report', 'question')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Public status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'closed', 'wont_fix')),
  
  -- Anonymous submission support
  author_name TEXT, -- For anonymous users
  author_email TEXT, -- For anonymous users
  
  -- Engagement metrics
  upvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Admin fields
  admin_response TEXT,
  admin_notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- SEO friendly
  slug TEXT UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public comments on tickets
CREATE TABLE ticket_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES feedback_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  
  -- Anonymous comment support
  author_name TEXT, -- For anonymous users
  author_email TEXT, -- For anonymous users
  
  -- Admin/OP markers
  is_admin_response BOOLEAN DEFAULT FALSE,
  is_solution BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket upvotes (for future enhancement)
CREATE TABLE ticket_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES feedback_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id, user_id)
);

-- ============================================================================
-- ADMIN & MODERATION
-- ============================================================================

-- Admin actions log
CREATE TABLE admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id),
  
  action TEXT NOT NULL, -- approve_deal, reject_deal, ban_user, etc.
  target_type TEXT NOT NULL, -- deal, user, review, etc.
  target_id UUID NOT NULL,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content reports
CREATE TABLE content_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  content_type TEXT NOT NULL, -- deal, review, profile
  content_id UUID NOT NULL,
  
  reason TEXT NOT NULL,
  description TEXT,
  
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOUNDER VERIFICATION
-- ============================================================================

-- Founder verification requests
CREATE TABLE founder_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Company details
  company_name TEXT NOT NULL,
  company_website TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_description TEXT NOT NULL,
  
  -- Verification documents
  document_urls TEXT[] DEFAULT '{}',
  
  -- Social proof
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profile indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_is_founder ON profiles(is_founder);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Deal indexes
CREATE INDEX idx_deals_founder_id ON deals(founder_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_category ON deals(category);
CREATE INDEX idx_deals_is_featured ON deals(is_featured);
CREATE INDEX idx_deals_expires_at ON deals(expires_at);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX idx_deals_slug ON deals(slug);

-- Deal codes indexes
CREATE INDEX idx_deal_codes_deal_id ON deal_codes(deal_id);
CREATE INDEX idx_deal_codes_user_id ON deal_codes(user_id);
CREATE INDEX idx_deal_codes_is_claimed ON deal_codes(is_claimed);

-- Analytics indexes
CREATE INDEX idx_deal_analytics_deal_id_date ON deal_analytics(deal_id, date DESC);
CREATE INDEX idx_user_activity_user_id_created ON user_activity(user_id, created_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Newsletter subscriber indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_is_active ON newsletter_subscribers(is_active);
CREATE INDEX idx_newsletter_subscribers_source ON newsletter_subscribers(source);
CREATE INDEX idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Feedback submission indexes
CREATE INDEX idx_feedback_submissions_user_id ON feedback_submissions(user_id);
CREATE INDEX idx_feedback_submissions_feedback_type ON feedback_submissions(feedback_type);
CREATE INDEX idx_feedback_submissions_status ON feedback_submissions(status);
CREATE INDEX idx_feedback_submissions_created_at ON feedback_submissions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Deals policies
CREATE POLICY "Anyone can view live deals" ON deals FOR SELECT USING (status = 'live');
CREATE POLICY "Founders can view own deals" ON deals FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Founders can create deals" ON deals FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Founders can update own deals" ON deals FOR UPDATE USING (auth.uid() = founder_id);
CREATE POLICY "Admins can view all deals" ON deals FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update all deals" ON deals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Deal codes policies
CREATE POLICY "Users can view codes for live deals" ON deal_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND status = 'live')
);
CREATE POLICY "Users can claim unclaimed codes" ON deal_codes FOR UPDATE USING (
  NOT is_claimed AND 
  EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND status = 'live')
);

-- User favorites policies
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- User follows policies  
CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON deal_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON deal_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON deal_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Customer/subscription policies (restrict to own data)
CREATE POLICY "Users can view own customer data" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Founder verification policies
CREATE POLICY "Users can manage own verification" ON founder_verifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all verifications" ON founder_verifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Newsletter subscriber policies (public for subscription, admin-only for management)
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Subscribers can update own subscription" ON newsletter_subscribers FOR UPDATE USING (
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can view all subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Feedback submission policies (public for submission, restricted for viewing)
CREATE POLICY "Anyone can submit feedback" ON feedback_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own feedback" ON feedback_submissions FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Admins can view all feedback" ON feedback_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update feedback" ON feedback_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deal_reviews_updated_at BEFORE UPDATE ON deal_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_submissions_updated_at BEFORE UPDATE ON feedback_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update codes_remaining when codes are claimed
CREATE OR REPLACE FUNCTION update_deal_codes_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_claimed = TRUE AND OLD.is_claimed = FALSE THEN
    UPDATE deals 
    SET codes_remaining = codes_remaining - 1
    WHERE id = NEW.deal_id;
  ELSIF NEW.is_claimed = FALSE AND OLD.is_claimed = TRUE THEN
    UPDATE deals 
    SET codes_remaining = codes_remaining + 1
    WHERE id = NEW.deal_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deal_codes_remaining_trigger
  AFTER UPDATE ON deal_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_codes_remaining();

-- Function to initialize codes_remaining when deal is created
CREATE OR REPLACE FUNCTION initialize_deal_codes_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codes_remaining = NEW.total_codes;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER initialize_deal_codes_remaining_trigger
  BEFORE INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION initialize_deal_codes_remaining();

-- Function to generate deal codes
CREATE OR REPLACE FUNCTION generate_deal_codes(deal_id UUID, code_count INTEGER)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
BEGIN
  FOR i IN 1..code_count LOOP
    new_code := 'LAUNCH' || UPPER(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    INSERT INTO deal_codes (deal_id, code) 
    VALUES (deal_id, new_code);
  END LOOP;
END;
$$ language 'plpgsql';

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, stripe_price_id, billing_period, features, max_deals) VALUES
('Starter', 'Perfect for new founders', 2900, 'price_starter_monthly', 'month', 
 ARRAY['Up to 3 deals', 'Basic analytics', 'Email support'], 3),
('Growth', 'For growing businesses', 9900, 'price_growth_monthly', 'month',
 ARRAY['Up to 15 deals', 'Advanced analytics', 'Priority support', 'Featured deals'], 15),
('Scale', 'For established companies', 29900, 'price_scale_monthly', 'month', 
 ARRAY['Unlimited deals', 'Premium analytics', '24/7 support', 'Featured deals', 'Custom branding'], NULL);

-- Insert email templates
INSERT INTO email_templates (name, subject, html_body, text_body) VALUES
('deal_approved', 'Your deal has been approved!', 
 '<h1>Congratulations!</h1><p>Your deal "{{deal_title}}" has been approved and is now live.</p>',
 'Congratulations! Your deal "{{deal_title}}" has been approved and is now live.'),
('deal_rejected', 'Deal submission needs attention',
 '<h1>Deal Review Update</h1><p>Your deal "{{deal_title}}" needs some updates before it can go live.</p><p>Reason: {{rejection_reason}}</p>',
 'Your deal "{{deal_title}}" needs some updates. Reason: {{rejection_reason}}'),
('welcome', 'Welcome to LaunchBoost!',
 '<h1>Welcome!</h1><p>Thank you for joining LaunchBoost. Start discovering amazing SaaS deals!</p>',
 'Welcome to LaunchBoost! Start discovering amazing SaaS deals.');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for deal statistics
CREATE VIEW deal_stats AS
SELECT 
  d.*,
  COALESCE(r.avg_rating, 0) as avg_rating,
  COALESCE(r.review_count, 0) as review_count,
  p.full_name as founder_name,
  p.company_name,
  p.avatar_url as founder_avatar
FROM deals d
LEFT JOIN (
  SELECT 
    deal_id,
    AVG(rating) as avg_rating,
    COUNT(*) as review_count
  FROM deal_reviews 
  GROUP BY deal_id
) r ON d.id = r.deal_id
LEFT JOIN profiles p ON d.founder_id = p.id;

-- View for user dashboard
CREATE VIEW user_dashboard AS
SELECT 
  p.*,
  COUNT(DISTINCT f.id) as favorites_count,
  COUNT(DISTINCT fl.following_id) as following_count,
  COUNT(DISTINCT flr.follower_id) as followers_count,
  s.status as subscription_status,
  sp.name as plan_name
FROM profiles p
LEFT JOIN user_favorites f ON p.id = f.user_id
LEFT JOIN user_follows fl ON p.id = fl.follower_id  
LEFT JOIN user_follows flr ON p.id = flr.following_id
LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
GROUP BY p.id, s.status, sp.name;

-- ============================================================================
-- FINAL SETUP
-- ============================================================================

-- Create admin user function (run after creating your first user)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET role = 'super_admin' 
  WHERE email = user_email;
END;
$$ language 'plpgsql';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create storage bucket for deal images
INSERT INTO storage.buckets (id, name, public) VALUES ('deal-images', 'deal-images', true);

-- Storage policies for deal images
CREATE POLICY "Anyone can view deal images" ON storage.objects FOR SELECT USING (bucket_id = 'deal-images');
CREATE POLICY "Authenticated users can upload deal images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'deal-images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own deal images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'deal-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Add a comment to mark completion
COMMENT ON SCHEMA public IS 'LaunchBoost SaaS Platform - Complete database schema with all tables, indexes, policies, and functions';

-- Log the completion
DO $$
BEGIN
  RAISE NOTICE 'LaunchBoost database schema has been successfully created!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your Supabase environment variables';
  RAISE NOTICE '2. Run: SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE '3. Configure Stripe webhook endpoints';
  RAISE NOTICE '4. Set up email templates in your application';
END $$;
