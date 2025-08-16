-- Migration: Add missing columns and tables for new business model
-- Run this in your Supabase SQL editor

-- 1. Add missing columns to deals table
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS listing_type VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archive_reason VARCHAR(100);

-- 2. Create payment tracking table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  session_id VARCHAR(255),
  amount INTEGER, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'succeeded', 'failed'
  payment_type VARCHAR(50), -- 'listing_fee', 'deal_promotion'
  listing_tier VARCHAR(20), -- 'featured', 'premium'
  product_name VARCHAR(255),
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create admin actions log table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'approve_deal', 'reject_deal', 'archive_deal'
  target_id UUID, -- deal_id or other entity
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'deal_approved', 'deal_rejected', 'system_update'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_listing_type ON deals(listing_type);
CREATE INDEX IF NOT EXISTS idx_deals_payment_status ON deals(payment_status);
CREATE INDEX IF NOT EXISTS idx_deals_is_archived ON deals(is_archived);
CREATE INDEX IF NOT EXISTS idx_deals_archived_at ON deals(archived_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 6. Update deals table constraints and defaults
ALTER TABLE deals 
ALTER COLUMN listing_type SET DEFAULT 'free',
ALTER COLUMN payment_status SET DEFAULT 'unpaid',
ALTER COLUMN is_archived SET DEFAULT FALSE;

-- 7. Add check constraints
ALTER TABLE deals 
ADD CONSTRAINT chk_listing_type 
CHECK (listing_type IN ('free', 'featured', 'premium'));

ALTER TABLE deals 
ADD CONSTRAINT chk_payment_status 
CHECK (payment_status IN ('unpaid', 'paid', 'expired', 'refunded'));

ALTER TABLE payments 
ADD CONSTRAINT chk_payment_status 
CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled'));

ALTER TABLE payments 
ADD CONSTRAINT chk_payment_type 
CHECK (payment_type IN ('listing_fee', 'deal_promotion'));

-- 8. Create RLS policies for new tables

-- Payments table policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'super_admin')
    )
  );

-- Admin actions table policies
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin actions" ON admin_actions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'super_admin')
    )
  );

-- Notifications table policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 9. Create functions for automatic archiving

CREATE OR REPLACE FUNCTION archive_expired_deals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive deals that have expired and are not already archived
  UPDATE deals 
  SET 
    is_archived = TRUE,
    archived_at = NOW(),
    archive_reason = 'expired',
    status = 'expired'
  WHERE 
    expires_at < NOW() 
    AND is_archived = FALSE 
    AND status = 'live';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN archived_count;
END;
$$;

-- 10. Create a function to automatically set listing_type based on pricing_tier
CREATE OR REPLACE FUNCTION sync_listing_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sync listing_type with pricing_tier for consistency
  IF NEW.pricing_tier = 'featured' THEN
    NEW.listing_type = 'featured';
  ELSIF NEW.pricing_tier = 'premium' OR NEW.pricing_tier = 'pro' THEN
    NEW.listing_type = 'premium';
  ELSE
    NEW.listing_type = 'free';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for listing_type sync
CREATE TRIGGER sync_listing_type_trigger
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION sync_listing_type();

-- 11. Update existing deals to have proper listing_type
UPDATE deals 
SET listing_type = CASE 
  WHEN pricing_tier = 'featured' THEN 'featured'
  WHEN pricing_tier = 'premium' OR pricing_tier = 'pro' THEN 'premium'
  ELSE 'free'
END
WHERE listing_type IS NULL OR listing_type = 'free';

-- 12. Set payment_status based on existing pricing_tier
UPDATE deals 
SET payment_status = CASE 
  WHEN pricing_tier IN ('featured', 'premium', 'pro') THEN 'paid'
  ELSE 'unpaid'
END
WHERE payment_status = 'unpaid';

COMMENT ON TABLE payments IS 'Tracks all payment transactions for listing fees and deal promotions';
COMMENT ON TABLE admin_actions IS 'Logs all administrative actions for audit trail';
COMMENT ON TABLE notifications IS 'User notifications for deal status updates and system messages';
COMMENT ON FUNCTION archive_expired_deals() IS 'Archives deals that have passed their expiration date';
COMMENT ON FUNCTION sync_listing_type() IS 'Automatically syncs listing_type with pricing_tier for consistency';