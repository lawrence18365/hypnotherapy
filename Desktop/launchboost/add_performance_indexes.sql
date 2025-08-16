-- Database Performance Optimization
-- Add missing indexes for critical queries

-- Index for deal slug lookups (used on every deal page load)
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);

-- Index for founder dashboard queries  
CREATE INDEX IF NOT EXISTS idx_deals_founder_id ON deals(founder_id);

-- Index for feedback submissions by user
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_user_id ON feedback_submissions(user_id);

-- Index for feedback upvotes by submission (already optimized in N+1 fix, but index helps)
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_submission_id ON feedback_upvotes(feedback_submission_id);

-- Index for payments by user (used in payment verification)
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Composite index for payment verification queries
CREATE INDEX IF NOT EXISTS idx_payments_verification ON payments(user_id, status, payment_type, listing_tier);

-- Index for payment tracking (new security feature)
CREATE INDEX IF NOT EXISTS idx_payments_used_for_deal ON payments(used_for_deal_id);

-- Index for deal status and approval workflow
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

-- Index for featured deals ordering
CREATE INDEX IF NOT EXISTS idx_deals_featured ON deals(is_featured, featured_until) WHERE is_featured = true;

-- Index for deal categories
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);

-- Index for newsletter subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Index for active deals (not expired)
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(expires_at) WHERE status = 'approved';

ANALYZE;
