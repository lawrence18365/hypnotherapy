-- Fixed Database schema updates for discount code collection system
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to deals table if they don't exist
DO $$ 
BEGIN 
    -- Add code_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='deals' AND column_name='code_type') THEN
        ALTER TABLE deals ADD COLUMN code_type text CHECK (code_type IN ('universal', 'unique'));
    END IF;
    
    -- Add redemption_instructions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='deals' AND column_name='redemption_instructions') THEN
        ALTER TABLE deals ADD COLUMN redemption_instructions text;
    END IF;
END $$;

-- 2. Drop existing deal_codes table if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS deal_codes CASCADE;

-- 3. Create deal_codes table with all required columns
CREATE TABLE deal_codes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    code text NOT NULL,
    is_universal boolean DEFAULT false NOT NULL,
    is_claimed boolean DEFAULT false NOT NULL,
    claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    claimed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Add indexes for performance (now that table exists with all columns)
CREATE INDEX idx_deal_codes_deal_id ON deal_codes(deal_id);
CREATE INDEX idx_deal_codes_unclaimed ON deal_codes(deal_id, is_claimed) WHERE is_claimed = false;
CREATE INDEX idx_deal_codes_universal ON deal_codes(deal_id, is_universal) WHERE is_universal = true;
CREATE UNIQUE INDEX idx_deal_codes_unique_code_per_deal ON deal_codes(deal_id, code);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE deal_codes ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for deal_codes
CREATE POLICY "Users can view codes for their own deals" ON deal_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_codes.deal_id 
            AND deals.founder_id = auth.uid()
        )
    );

CREATE POLICY "Users can claim available codes" ON deal_codes
    FOR UPDATE USING (
        auth.uid() IS NOT NULL 
        AND is_claimed = false
        AND EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = deal_codes.deal_id 
            AND deals.status = 'approved'
        )
    );

CREATE POLICY "System can insert codes" ON deal_codes
    FOR INSERT WITH CHECK (true);

-- 7. Create function to get available code for a deal
CREATE OR REPLACE FUNCTION get_available_code(deal_uuid uuid, user_uuid uuid)
RETURNS TABLE(code text, code_id uuid) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    universal_code_record RECORD;
    unique_code_record RECORD;
    deal_record RECORD;
BEGIN
    -- Get deal info
    SELECT * INTO deal_record FROM deals WHERE id = deal_uuid AND status = 'approved';
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Check if user already has a code for this deal
    SELECT dc.code, dc.id INTO code, code_id 
    FROM deal_codes dc 
    WHERE dc.deal_id = deal_uuid 
    AND dc.claimed_by = user_uuid;
    
    IF FOUND THEN
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Check for universal code
    SELECT dc.code, dc.id INTO universal_code_record 
    FROM deal_codes dc 
    WHERE dc.deal_id = deal_uuid 
    AND dc.is_universal = true 
    LIMIT 1;
    
    IF FOUND THEN
        -- For universal codes, just return the code without claiming it
        code := universal_code_record.code;
        code_id := universal_code_record.id;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Try to claim a unique code
    UPDATE deal_codes 
    SET is_claimed = true, 
        claimed_by = user_uuid, 
        claimed_at = now()
    WHERE id = (
        SELECT dc.id 
        FROM deal_codes dc 
        WHERE dc.deal_id = deal_uuid 
        AND dc.is_universal = false 
        AND dc.is_claimed = false 
        LIMIT 1
    )
    RETURNING deal_codes.code, deal_codes.id INTO unique_code_record;
    
    IF FOUND THEN
        code := unique_code_record.code;
        code_id := unique_code_record.id;
        RETURN NEXT;
    END IF;
    
    RETURN;
END;
$$;

-- 8. Update existing deals to have a default code_type if needed
UPDATE deals 
SET code_type = 'universal' 
WHERE code_type IS NULL;

-- 9. Create function to automatically generate codes for existing deals (optional migration)
CREATE OR REPLACE FUNCTION migrate_existing_deals_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    deal_record RECORD;
    generated_code text;
BEGIN
    -- For each deal that doesn't have codes yet
    FOR deal_record IN 
        SELECT d.* FROM deals d 
        LEFT JOIN deal_codes dc ON d.id = dc.deal_id 
        WHERE dc.id IS NULL 
        AND d.status IN ('approved', 'pending_review')
    LOOP
        -- Generate a simple code from product name or use fallback
        generated_code := UPPER(COALESCE(
            REGEXP_REPLACE(SUBSTRING(deal_record.product_name, 1, 6), '[^A-Za-z0-9]', '', 'g'),
            'DEAL'
        )) || SUBSTRING(REPLACE(deal_record.id::text, '-', ''), 1, 4);
        
        -- Ensure code is at least 3 characters
        IF LENGTH(generated_code) < 3 THEN
            generated_code := 'LAUNCH' || SUBSTRING(REPLACE(deal_record.id::text, '-', ''), 1, 4);
        END IF;
        
        -- Create a universal code for each deal
        INSERT INTO deal_codes (deal_id, code, is_universal, is_claimed)
        VALUES (
            deal_record.id, 
            generated_code,
            true, 
            false
        );
    END LOOP;
END;
$$;

-- 10. Run the migration for existing deals
SELECT migrate_existing_deals_codes();

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON deal_codes TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_code(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_existing_deals_codes() TO authenticated;

-- 12. Verify the setup
DO $$
DECLARE
    table_exists boolean;
    column_count integer;
    deals_updated integer;
    codes_created integer;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'deal_codes'
    ) INTO table_exists;
    
    -- Count columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'deal_codes';
    
    -- Count deals with code_type
    SELECT COUNT(*) INTO deals_updated
    FROM deals 
    WHERE code_type IS NOT NULL;
    
    -- Count codes created
    SELECT COUNT(*) INTO codes_created
    FROM deal_codes;
    
    RAISE NOTICE 'Setup verification:';
    RAISE NOTICE '- deal_codes table exists: %', table_exists;
    RAISE NOTICE '- deal_codes columns count: %', column_count;
    RAISE NOTICE '- deals with code_type: %', deals_updated;
    RAISE NOTICE '- total codes created: %', codes_created;
    
    IF table_exists AND column_count >= 8 THEN
        RAISE NOTICE 'SUCCESS: Database schema updated successfully!';
    ELSE
        RAISE NOTICE 'WARNING: Setup may not be complete. Please check manually.';
    END IF;
END $$;

-- Success message
SELECT 'Database schema updated successfully for discount code collection system!' as result;
