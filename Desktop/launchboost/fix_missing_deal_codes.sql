-- Fix Missing Deal Codes - Generate codes for all existing deals
-- Run this in your Supabase SQL Editor to populate deal codes

-- First, let's see what deals exist without codes
DO $$
DECLARE
  deal_record RECORD;
  i INTEGER;
  new_code TEXT;
  codes_to_generate INTEGER;
BEGIN
  -- Loop through all deals that don't have codes
  FOR deal_record IN 
    SELECT d.id, d.title, d.total_codes, 
           COALESCE(d.codes_remaining, d.total_codes) as codes_remaining
    FROM deals d
    WHERE d.status = 'live'
    AND NOT EXISTS (
      SELECT 1 FROM deal_codes dc WHERE dc.deal_id = d.id
    )
  LOOP
    -- Generate codes for this deal
    codes_to_generate := COALESCE(deal_record.codes_remaining, deal_record.total_codes, 50);
    
    RAISE NOTICE 'Generating % codes for deal: %', codes_to_generate, deal_record.title;
    
    FOR i IN 1..codes_to_generate LOOP
      -- Generate a unique code
      new_code := 'LAUNCH' || UPPER(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
      
      -- Make sure it's unique (retry if collision)
      WHILE EXISTS (SELECT 1 FROM deal_codes WHERE code = new_code) LOOP
        new_code := 'LAUNCH' || UPPER(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
      END LOOP;
      
      -- Insert the code
      INSERT INTO deal_codes (deal_id, code, is_claimed) 
      VALUES (deal_record.id, new_code, FALSE);
    END LOOP;
    
    -- Update the deal's codes_remaining to match what we generated
    UPDATE deals 
    SET codes_remaining = codes_to_generate,
        total_codes = GREATEST(total_codes, codes_to_generate)
    WHERE id = deal_record.id;
    
  END LOOP;
  
  RAISE NOTICE 'Code generation complete!';
END $$;

-- Now let's check our work
SELECT 
  d.title,
  d.total_codes,
  d.codes_remaining,
  COUNT(dc.id) as actual_codes_in_table,
  COUNT(CASE WHEN dc.is_claimed = FALSE THEN 1 END) as unclaimed_codes
FROM deals d
LEFT JOIN deal_codes dc ON d.id = dc.deal_id
WHERE d.status = 'live'
GROUP BY d.id, d.title, d.total_codes, d.codes_remaining
ORDER BY d.created_at DESC;
