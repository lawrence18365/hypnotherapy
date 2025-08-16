-- QUICK FIX: Generate codes for all live deals
-- Copy and paste this into your Supabase SQL Editor and run it

-- Generate 50 codes for each live deal that doesn't have any codes
DO $$
DECLARE
  deal_record RECORD;
  i INTEGER;
  new_code TEXT;
BEGIN
  -- Find all live deals without codes
  FOR deal_record IN 
    SELECT id, title FROM deals 
    WHERE status = 'live' 
    AND NOT EXISTS (SELECT 1 FROM deal_codes WHERE deal_id = deals.id)
  LOOP
    RAISE NOTICE 'Creating codes for: %', deal_record.title;
    
    -- Generate 50 codes for this deal
    FOR i IN 1..50 LOOP
      new_code := 'LAUNCH' || UPPER(substring(encode(gen_random_bytes(4), 'base64') from 1 for 6));
      
      INSERT INTO deal_codes (deal_id, code, is_claimed) 
      VALUES (deal_record.id, new_code, FALSE);
    END LOOP;
    
    -- Update the deal's codes count
    UPDATE deals 
    SET codes_remaining = 50, total_codes = 50 
    WHERE id = deal_record.id;
  END LOOP;
  
  RAISE NOTICE 'Done! All live deals now have 50 claimable codes.';
END $$;

-- Check the results
SELECT 
  title,
  codes_remaining,
  (SELECT COUNT(*) FROM deal_codes WHERE deal_id = deals.id AND is_claimed = FALSE) as actual_available_codes
FROM deals 
WHERE status = 'live'
ORDER BY created_at DESC;
