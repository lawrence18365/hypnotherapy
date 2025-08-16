-- Psychological Features Database Setup
-- Creates authentic investment features for habit-forming behavior with 100% real data

-- 1. Enhanced user_favorites table (ensure optimized for psychological investment)
ALTER TABLE user_favorites 
ADD COLUMN IF NOT EXISTS original_price_when_saved INTEGER,
ADD COLUMN IF NOT EXISTS alert_price_threshold INTEGER, -- User's desired price
ADD COLUMN IF NOT EXISTS last_price_check_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS price_drop_alerts_enabled BOOLEAN DEFAULT TRUE;

-- 2. Create deal price history table for price drop alerts
CREATE TABLE IF NOT EXISTS deal_price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  original_price INTEGER NOT NULL,
  deal_price INTEGER NOT NULL,
  discount_percentage INTEGER,
  price_change_reason TEXT, -- 'manual_update', 'promotion_start', 'promotion_end'
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user preferences table for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Deal preferences (for personalized variable rewards)
  preferred_categories deal_category[] DEFAULT '{}',
  min_discount_threshold INTEGER DEFAULT 20, -- Only show deals with X% or more discount
  max_budget INTEGER, -- Maximum price they're willing to pay (in cents)
  
  -- Notification preferences
  email_deal_alerts BOOLEAN DEFAULT TRUE,
  email_price_drops BOOLEAN DEFAULT TRUE,
  email_new_categories BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Browsing preferences
  deals_per_page INTEGER DEFAULT 20,
  default_sort_order TEXT DEFAULT 'discount_desc', -- discount_desc, expiry_asc, newest
  
  -- Investment tracking (key for psychological commitment)
  total_saved_amount INTEGER DEFAULT 0, -- Running total of their savings
  deals_claimed_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  return_visit_count INTEGER DEFAULT 0, -- Track habit formation
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create deal watches table (advanced price monitoring = high investment)
CREATE TABLE IF NOT EXISTS deal_watches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  watch_type TEXT DEFAULT 'price_drop', -- price_drop, back_in_stock, expires_soon
  target_price INTEGER, -- Alert when deal price drops to this amount
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id, watch_type)
);

-- 5. Create referral system table for viral growth (authentic pre-launch tactic)
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  completed_at TIMESTAMPTZ,
  
  -- Rewards (real incentives, not fake)
  referrer_reward_amount INTEGER DEFAULT 0, -- in cents
  referred_reward_amount INTEGER DEFAULT 0, -- in cents
  reward_claimed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 6. Create user achievements table for gamification (real achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT, -- emoji or icon class
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- Store achievement-specific data
  UNIQUE(user_id, achievement_type)
);

-- 7. Create variable reward tracking (psychological slot machine effect)
CREATE TABLE IF NOT EXISTS user_reward_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'surprise_deal', 'flash_deal', 'early_access', 'bonus_discount'
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  reward_value INTEGER, -- bonus discount percentage or special access
  triggered_by TEXT, -- 'daily_visit', 'deal_save', 'social_share', 'random'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id_created ON user_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_deal_id ON user_favorites(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_price_history_deal_id_recorded ON deal_price_history(deal_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_watches_user_id_active ON deal_watches(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_history_user_id ON user_reward_history(user_id, created_at DESC);

-- 9. Create RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_history ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Deal watches policies
CREATE POLICY "Users can manage own watches" ON deal_watches FOR ALL USING (auth.uid() = user_id);

-- Referral policies
CREATE POLICY "Users can view own referrals" ON user_referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can create referrals" ON user_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Price history policies (public for transparency)
CREATE POLICY "Anyone can view price history" ON deal_price_history FOR SELECT USING (true);

-- Reward history policies
CREATE POLICY "Users can view own rewards" ON user_reward_history FOR SELECT USING (auth.uid() = user_id);

-- 10. Functions for psychological behavior tracking

-- Function to track price changes (triggers real price drop alerts)
CREATE OR REPLACE FUNCTION track_deal_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if price actually changed
  IF OLD.original_price != NEW.original_price OR OLD.deal_price != NEW.deal_price THEN
    INSERT INTO deal_price_history (
      deal_id, 
      original_price, 
      deal_price, 
      discount_percentage,
      price_change_reason
    ) VALUES (
      NEW.id,
      NEW.original_price,
      NEW.deal_price,
      NEW.discount_percentage,
      'manual_update'
    );
    
    -- Update last price check for all users watching this deal
    UPDATE user_favorites 
    SET last_price_check_at = NOW()
    WHERE deal_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for price tracking
DROP TRIGGER IF EXISTS track_deal_price_changes ON deals;
CREATE TRIGGER track_deal_price_changes
  AFTER UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION track_deal_price_change();

-- Function to update user stats (investment tracking)
CREATE OR REPLACE FUNCTION update_user_investment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- User saved a deal (major psychological investment)
    IF TG_TABLE_NAME = 'user_favorites' THEN
      UPDATE user_preferences 
      SET wishlist_count = wishlist_count + 1
      WHERE user_id = NEW.user_id;
      
      -- Track as investment behavior for variable rewards
      INSERT INTO user_reward_history (user_id, reward_type, deal_id, triggered_by)
      VALUES (NEW.user_id, 'save_action', NEW.deal_id, 'deal_save');
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- User removed a deal from favorites
    IF TG_TABLE_NAME = 'user_favorites' THEN
      UPDATE user_preferences 
      SET wishlist_count = GREATEST(0, wishlist_count - 1)
      WHERE user_id = OLD.user_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for investment tracking
DROP TRIGGER IF EXISTS update_user_wishlist_stats ON user_favorites;
CREATE TRIGGER update_user_wishlist_stats
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_user_investment_stats();

-- Function to grant real achievements (not fake badges)
CREATE OR REPLACE FUNCTION grant_achievement(
  p_user_id UUID,
  p_achievement_type TEXT,
  p_achievement_name TEXT,
  p_description TEXT DEFAULT '',
  p_badge_icon TEXT DEFAULT '🏆'
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_achievements (
    user_id,
    achievement_type,
    achievement_name,
    description,
    badge_icon
  ) VALUES (
    p_user_id,
    p_achievement_type,
    p_achievement_name,
    p_description,
    p_badge_icon
  ) ON CONFLICT (user_id, achievement_type) DO NOTHING;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function for variable reward algorithm (authentic surprise mechanics)
CREATE OR REPLACE FUNCTION trigger_variable_reward(p_user_id UUID, p_trigger_type TEXT)
RETURNS TABLE(reward_granted BOOLEAN, reward_type TEXT, bonus_value INTEGER) AS $$
DECLARE
  visit_count INTEGER;
  random_chance FLOAT;
  reward_type_result TEXT := '';
  bonus_value_result INTEGER := 0;
  reward_granted_result BOOLEAN := FALSE;
BEGIN
  -- Get user's visit history for personalized rewards
  SELECT return_visit_count INTO visit_count
  FROM user_preferences 
  WHERE user_id = p_user_id;
  
  -- Generate random chance (0.0 to 1.0)
  random_chance := random();
  
  -- Variable reward logic based on psychological research
  IF p_trigger_type = 'daily_visit' THEN
    -- 15% chance of surprise on daily visits
    IF random_chance < 0.15 THEN
      reward_type_result := 'surprise_deal';
      bonus_value_result := 5 + floor(random() * 15)::INTEGER; -- 5-20% bonus
      reward_granted_result := TRUE;
    END IF;
    
  ELSIF p_trigger_type = 'deal_save' THEN
    -- 25% chance after saving deals (higher engagement reward)
    IF random_chance < 0.25 THEN
      reward_type_result := 'flash_deal';
      bonus_value_result := 10 + floor(random() * 20)::INTEGER; -- 10-30% bonus
      reward_granted_result := TRUE;
    END IF;
    
  ELSIF p_trigger_type = 'streak_visit' AND visit_count >= 3 THEN
    -- Reward consistent users (every 3rd+ visit has 40% chance)
    IF random_chance < 0.40 THEN
      reward_type_result := 'early_access';
      bonus_value_result := 24; -- 24 hours early access
      reward_granted_result := TRUE;
    END IF;
  END IF;
  
  -- Log the reward if granted
  IF reward_granted_result THEN
    INSERT INTO user_reward_history (user_id, reward_type, triggered_by, reward_value)
    VALUES (p_user_id, reward_type_result, p_trigger_type, bonus_value_result);
  END IF;
  
  RETURN QUERY SELECT reward_granted_result, reward_type_result, bonus_value_result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate a 8-character code
    code := UPPER(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    
    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM user_referrals WHERE referral_code = code) THEN
      RETURN code;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. Achievement checking for real milestones
CREATE OR REPLACE FUNCTION check_and_grant_achievements()
RETURNS TRIGGER AS $$
DECLARE
  wishlist_count INTEGER;
BEGIN
  -- Check wishlist milestones (real achievements for real behavior)
  SELECT COUNT(*) INTO wishlist_count 
  FROM user_favorites 
  WHERE user_id = NEW.user_id;
  
  -- Grant achievements based on actual behavior
  IF wishlist_count = 1 THEN
    PERFORM grant_achievement(NEW.user_id, 'first_save', 'First Save', 'Saved your first deal!', '⭐');
  ELSIF wishlist_count = 5 THEN
    PERFORM grant_achievement(NEW.user_id, 'deal_collector', 'Deal Collector', 'Saved 5 deals!', '📚');
  ELSIF wishlist_count = 10 THEN
    PERFORM grant_achievement(NEW.user_id, 'deal_hunter', 'Deal Hunter', 'Saved 10 deals!', '🏹');
  ELSIF wishlist_count = 25 THEN
    PERFORM grant_achievement(NEW.user_id, 'deal_master', 'Deal Master', 'Saved 25 deals!', '👑');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real achievement checking
DROP TRIGGER IF EXISTS check_achievements_on_save ON user_favorites;
CREATE TRIGGER check_achievements_on_save
  AFTER INSERT ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION check_and_grant_achievements();

-- 12. Initialize user preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM profiles 
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE user_id IS NOT NULL);

-- 13. Create view for user psychology dashboard
CREATE OR REPLACE VIEW user_psychology_stats AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  up.total_saved_amount,
  up.deals_claimed_count,
  up.wishlist_count,
  up.return_visit_count,
  COUNT(DISTINCT uf.id) AS current_wishlist_count,
  COUNT(DISTINCT ua.id) AS achievements_count,
  COUNT(DISTINCT ur.id) AS successful_referrals,
  COUNT(DISTINCT urh.id) AS total_rewards_received,
  COALESCE(MAX(urh.created_at), p.created_at) AS last_reward_date
FROM profiles p
LEFT JOIN user_preferences up ON p.id = up.user_id
LEFT JOIN user_favorites uf ON p.id = uf.user_id
LEFT JOIN user_achievements ua ON p.id = ua.user_id
LEFT JOIN user_referrals ur ON p.id = ur.referrer_id AND ur.status = 'completed'
LEFT JOIN user_reward_history urh ON p.id = urh.user_id
GROUP BY p.id, p.full_name, p.email, up.total_saved_amount, up.deals_claimed_count, up.wishlist_count, up.return_visit_count;

COMMENT ON TABLE user_preferences IS 'User preferences for personalized psychological experience';
COMMENT ON TABLE deal_watches IS 'Price monitoring creates high investment behavior';
COMMENT ON TABLE user_referrals IS 'Authentic viral referral system for pre-launch growth';
COMMENT ON TABLE user_achievements IS 'Real achievement system based on actual behavior';
COMMENT ON TABLE user_reward_history IS 'Variable reward tracking for habit formation';
COMMENT ON FUNCTION trigger_variable_reward IS 'Implements psychological variable reward schedule';