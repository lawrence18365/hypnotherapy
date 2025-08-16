-- Update payments table to support payment tracking
-- Required for the payment security fix

-- Add column to track which deal a payment was used for
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS used_for_deal_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN payments.used_for_deal_id IS 'ID of the deal this payment was used for, prevents payment reuse';

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_payments_used_for_deal ON payments(used_for_deal_id);
