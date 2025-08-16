-- Fix the expired test deal to make it active again
UPDATE deals 
SET 
  expires_at = (NOW() + INTERVAL '30 days'),
  updated_at = NOW()
WHERE 
  id = '2537e8f4-1f74-4af1-9063-d98eabc894d8'
  AND status = 'live';

-- Verify the update
SELECT 
  id,
  title,
  status,
  expires_at,
  discount_percentage,
  original_price,
  deal_price
FROM deals 
WHERE id = '2537e8f4-1f74-4af1-9063-d98eabc894d8';