-- Fix Sample Deal Icons - Add Real SaaS Product Logos
-- Run this to add proper product icons to existing sample deals

-- Update sample deals with real product logo URLs
UPDATE deals SET product_logo_url = 'https://www.notion.so/front-static/favicon.ico' WHERE slug = 'notion-pro-75-off';
UPDATE deals SET product_logo_url = 'https://about.canva.com/wp-content/uploads/sites/8/2019/03/canva-symbol.png' WHERE slug = 'canva-pro-6-months-free';
UPDATE deals SET product_logo_url = 'https://static.figma.com/app/icon/1/favicon.png' WHERE slug = 'figma-professional-50-off';
UPDATE deals SET product_logo_url = 'https://assets-global.website-files.com/5e51b3b0337309d672efd94c/5eebf7c75af89fb918dff75a_webflow-logo-256.png' WHERE slug = 'webflow-professional-40-off';
UPDATE deals SET product_logo_url = 'https://airtable.com/images/favicon/baymax/apple-touch-icon.png' WHERE slug = 'airtable-pro-3-months-free';
UPDATE deals SET product_logo_url = 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png' WHERE slug = 'slack-pro-25-off';
UPDATE deals SET product_logo_url = 'https://convertkit.s3.amazonaws.com/assets/pictures/7151/1123/content_ck-logo-mark-black-800.png' WHERE slug = 'convertkit-creator-pro-60-off';
UPDATE deals SET product_logo_url = 'https://linear.app/favicon.ico' WHERE slug = 'linear-pro-lifetime';
UPDATE deals SET product_logo_url = 'https://cdn.loom.com/assets/favicons-loom/apple-touch-icon.png' WHERE slug = 'loom-business-45-off';
UPDATE deals SET product_logo_url = 'https://images.typeform.com/images/6bdc2b776b36/typeform-logo' WHERE slug = 'typeform-pro-50-off';

-- Verify the updates
SELECT 
  slug, 
  title,
  product_logo_url,
  CASE 
    WHEN product_logo_url IS NOT NULL THEN '✅ Has Icon'
    ELSE '❌ No Icon'
  END as icon_status
FROM deals 
WHERE slug IN (
  'notion-pro-75-off', 'canva-pro-6-months-free', 'figma-professional-50-off',
  'webflow-professional-40-off', 'airtable-pro-3-months-free', 'slack-pro-25-off',
  'convertkit-creator-pro-60-off', 'linear-pro-lifetime', 'loom-business-45-off', 'typeform-pro-50-off'
)
ORDER BY created_at;

-- Summary
SELECT 
  COUNT(*) as total_deals,
  COUNT(product_logo_url) as deals_with_icons,
  ROUND((COUNT(product_logo_url) * 100.0 / COUNT(*)), 1) as icon_percentage
FROM deals;
