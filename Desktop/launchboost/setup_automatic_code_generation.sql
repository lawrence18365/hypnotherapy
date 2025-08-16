-- Enhanced Deal Code Generation System
-- This script improves the deal code generation and ensures codes are created automatically

-- Improved function to generate deal codes with better randomization
CREATE OR REPLACE FUNCTION generate_deal_codes(deal_id UUID, code_count INTEGER)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
  max_attempts INTEGER := 10;
  attempts INTEGER;
BEGIN
  FOR i IN 1..code_count LOOP
    attempts := 0;
    
    -- Generate unique code with retry logic
    LOOP
      -- Create more readable codes: LAUNCH + 6 alphanumeric characters
      new_code := 'LAUNCH' || UPPER(
        translate(
          encode(gen_random_bytes(4), 'base64'),
          '+/=', 
          'XYZ'
        )
      );
      new_code := substring(new_code from 1 for 12);
      
      -- Check if code is unique
      IF NOT EXISTS (SELECT 1 FROM deal_codes WHERE code = new_code) THEN
        EXIT; -- Code is unique, exit loop
      END IF;
      
      attempts := attempts + 1;
      IF attempts >= max_attempts THEN
        -- Fallback: add timestamp to ensure uniqueness
        new_code := new_code || extract(epoch from now())::bigint::text;
        EXIT;
      END IF;
    END LOOP;
    
    -- Insert the code
    INSERT INTO deal_codes (deal_id, code, is_claimed) 
    VALUES (deal_id, new_code, FALSE);
  END LOOP;
  
  RAISE NOTICE 'Generated % codes for deal %', code_count, deal_id;
END;
$$ language 'plpgsql';

-- Function to automatically generate codes when a deal goes live
CREATE OR REPLACE FUNCTION auto_generate_codes_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If deal status changed to 'live' and no codes exist yet
  IF NEW.status = 'live' AND (OLD.status IS NULL OR OLD.status != 'live') THEN
    -- Check if codes already exist
    IF NOT EXISTS (SELECT 1 FROM deal_codes WHERE deal_id = NEW.id) THEN
      -- Generate codes based on total_codes field
      PERFORM generate_deal_codes(NEW.id, COALESCE(NEW.total_codes, 50));
      
      -- Update codes_remaining to match total_codes
      NEW.codes_remaining = COALESCE(NEW.total_codes, 50);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-generate codes when deal goes live
DROP TRIGGER IF EXISTS auto_generate_codes_trigger ON deals;
CREATE TRIGGER auto_generate_codes_trigger
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_codes_on_status_change();

-- Also trigger on insert for deals that start as 'live'
CREATE OR REPLACE FUNCTION auto_generate_codes_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If deal is created with 'live' status
  IF NEW.status = 'live' THEN
    -- Generate codes after the deal is inserted
    PERFORM generate_deal_codes(NEW.id, COALESCE(NEW.total_codes, 50));
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS auto_generate_codes_insert_trigger ON deals;
CREATE TRIGGER auto_generate_codes_insert_trigger
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_codes_on_insert();

-- Fix existing deals that don't have codes
DO $$
DECLARE
  deal_record RECORD;
  codes_needed INTEGER;
BEGIN
  RAISE NOTICE 'Checking for deals without codes...';
  
  FOR deal_record IN 
    SELECT d.id, d.title, d.total_codes, d.codes_remaining, d.status
    FROM deals d
    WHERE d.status = 'live'
    AND NOT EXISTS (SELECT 1 FROM deal_codes dc WHERE dc.deal_id = d.id)
  LOOP
    codes_needed := COALESCE(deal_record.total_codes, 50);
    
    RAISE NOTICE 'Generating % codes for: %', codes_needed, deal_record.title;
    
    -- Generate codes for this deal
    PERFORM generate_deal_codes(deal_record.id, codes_needed);
    
    -- Update codes_remaining
    UPDATE deals 
    SET codes_remaining = codes_needed,
        total_codes = codes_needed
    WHERE id = deal_record.id;
  END LOOP;
  
  RAISE NOTICE 'Deal code generation complete!';
END $$;

-- Verify the results
SELECT 
  d.title,
  d.status,
  d.total_codes,
  d.codes_remaining,
  COUNT(dc.id) as total_codes_generated,
  COUNT(CASE WHEN dc.is_claimed = FALSE THEN 1 END) as available_codes,
  COUNT(CASE WHEN dc.is_claimed = TRUE THEN 1 END) as claimed_codes
FROM deals d
LEFT JOIN deal_codes dc ON d.id = dc.deal_id
WHERE d.status = 'live'
GROUP BY d.id, d.title, d.status, d.total_codes, d.codes_remaining
ORDER BY d.created_at DESC;
