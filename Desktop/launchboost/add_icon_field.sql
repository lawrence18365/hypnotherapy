-- Add icon_url field to deals table for product icons/logos
ALTER TABLE deals ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN deals.icon_url IS 'URL to the product icon/logo image (uploaded via Cloudflare R2)';

-- Create index for better performance when filtering deals with icons
CREATE INDEX IF NOT EXISTS idx_deals_icon_url ON deals(icon_url) WHERE icon_url IS NOT NULL;