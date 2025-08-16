-- Sample Fictional SaaS Deals for Testing Psychological Features
-- Run this after setting up the psychological features database
-- ALL COMPANIES BELOW ARE FICTIONAL - FOR TESTING ONLY

-- Insert sample deals with realistic pricing and details using FICTIONAL companies
INSERT INTO deals (
  founder_id, 
  title, 
  slug, 
  description, 
  short_description,
  category,
  tags,
  product_name,
  product_website,
  original_price,
  deal_price,
  total_codes,
  codes_remaining,
  deal_type,
  expires_at,
  status,
  pricing_tier,
  is_featured
) VALUES 
(
  (SELECT id FROM profiles LIMIT 1), -- Use first available user as founder
  'TaskFlow Pro - 75% Off Annual Plan',
  'taskflow-pro-75-off',
  'The all-in-one workspace for growing teams. Combine notes, tasks, wikis, and databases in one powerful tool. Perfect for project management, documentation, and team collaboration.',
  'All-in-one workspace combining notes, tasks, wikis, and databases',
  'Productivity & Organization',
  ARRAY['productivity', 'collaboration', 'notes', 'database'],
  'TaskFlow Pro',
  'https://example-taskflow.com',
  9600, -- $96/year normally
  2400, -- $24/year with deal (75% off)
  100,
  100,
  'discount',
  NOW() + INTERVAL '7 days',
  'live',
  'featured',
  true
),
(
  (SELECT id FROM profiles LIMIT 1),
  'DesignCraft Pro - 6 Months Free',
  'designcraft-pro-6-months-free',
  'Design like a pro with thousands of premium templates, photos, and graphics. Create stunning social media posts, presentations, logos, and marketing materials. Perfect for creators, marketers, and small businesses.',
  'Professional design tool with premium templates and assets',
  'Design & Creative',
  ARRAY['design', 'graphics', 'templates', 'marketing'],
  'DesignCraft Pro',
  'https://example-designcraft.com',
  14400, -- $144/year normally  
  0, -- Free for 6 months
  150,
  150,
  'free_trial',
  NOW() + INTERVAL '3 days',
  'live',
  'featured',
  true
),
(
  (SELECT id FROM profiles LIMIT 1),
  'ProtoMaker Professional - 50% Off First Year',
  'protomaker-professional-50-off',
  'The collaborative design platform for growing teams. Create, prototype, and collaborate on designs in real-time. Includes unlimited projects, version history, and team libraries.',
  'Collaborative design and prototyping platform for teams',
  'Design & Creative',
  ARRAY['design', 'prototyping', 'collaboration', 'ui-ux'],
  'ProtoMaker',
  'https://example-protomaker.com',
  18000, -- $180/year normally
  9000, -- $90/year with deal (50% off)
  75,
  75,
  'discount',
  NOW() + INTERVAL '5 days',
  'live',
  'pro',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'CodelessWeb Professional - 40% Off',
  'codelessweb-professional-40-off',
  'Build responsive websites visually without code. Includes CMS, ecommerce, and hosting. Perfect for designers and agencies who want the power of code with visual ease.',
  'Visual web development platform with CMS and hosting',
  'Developer Tools',
  ARRAY['web-development', 'no-code', 'cms', 'hosting'],
  'CodelessWeb',
  'https://example-codelessweb.com',
  42000, -- $420/year normally
  25200, -- $252/year with deal (40% off)
  50,
  50,
  'discount',
  NOW() + INTERVAL '10 days',
  'live',
  'free',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'DataGrid Pro - 3 Months Free',
  'datagrid-pro-3-months-free',
  'Database meets spreadsheet in a powerful collaboration tool. Organize anything with custom fields, views, and workflows. Perfect for project management, CRM, and content planning.',
  'Powerful database-spreadsheet hybrid for team collaboration',
  'Productivity & Organization',
  ARRAY['database', 'spreadsheet', 'collaboration', 'project-management'],
  'DataGrid',
  'https://example-datagrid.com',
  24000, -- $240/year normally
  18000, -- 3 months free = 25% off annually
  80,
  80,
  'free_trial',
  NOW() + INTERVAL '2 days',
  'live',
  'free',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'TeamChat Pro - 25% Off Annual',
  'teamchat-pro-25-off',
  'Transform team communication with organized conversations, file sharing, and app integrations. Keep your team connected and productive with channels, direct messages, and powerful search.',
  'Team communication platform with channels and integrations',
  'Communication & Collaboration',
  ARRAY['communication', 'team-chat', 'collaboration', 'integrations'],
  'TeamChat',
  'https://example-teamchat.com',
  10200, -- $102/year per user normally
  7650, -- $76.50/year with deal (25% off)
  200,
  200,
  'discount',
  NOW() + INTERVAL '14 days',
  'live',
  'free',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'CreatorMail Pro - 60% Off',
  'creatormail-pro-60-off',
  'Email marketing platform built for creators. Grow your audience with landing pages, opt-in forms, email sequences, and detailed analytics. Perfect for creators and course builders.',
  'Email marketing platform designed specifically for creators',
  'Marketing & Growth',
  ARRAY['email-marketing', 'creators', 'landing-pages', 'automation'],
  'CreatorMail',
  'https://example-creatormail.com',
  35400, -- $354/year normally
  14160, -- $141.60/year with deal (60% off)
  60,
  60,
  'discount',
  NOW() + INTERVAL '4 days',
  'live',
  'featured',
  true
),
(
  (SELECT id FROM profiles LIMIT 1),
  'IssueTracker Pro - Lifetime Deal',
  'issuetracker-pro-lifetime',
  'The issue tracking tool your team will actually enjoy using. Beautiful, fast, and purpose-built for modern software teams. Includes unlimited projects, custom workflows, and integrations.',
  'Modern issue tracking and project management for dev teams',
  'Developer Tools',
  ARRAY['project-management', 'issue-tracking', 'development', 'team-tools'],
  'IssueTracker',
  'https://example-issuetracker.com',
  96000, -- $960/year normally
  29900, -- $299 lifetime (huge savings)
  25,
  25,
  'lifetime',
  NOW() + INTERVAL '6 days',
  'live',
  'pro',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'QuickRecord Business - 45% Off First Year',
  'quickrecord-business-45-off',
  'Record and share video messages instantly. Perfect for tutorials, feedback, sales demos, and team updates. Includes screen recording, video editing, and team collaboration features.',
  'Instant video messaging for better communication',
  'Communication & Collaboration',
  ARRAY['video', 'screen-recording', 'communication', 'tutorials'],
  'QuickRecord',
  'https://example-quickrecord.com',
  9600, -- $96/year normally
  5280, -- $52.80/year with deal (45% off)
  120,
  120,
  'discount',
  NOW() + INTERVAL '8 days',
  'live',
  'free',
  false
),
(
  (SELECT id FROM profiles LIMIT 1),
  'FormBuilder Pro - 50% Off',
  'formbuilder-pro-50-off',
  'Create beautiful forms, surveys, and quizzes that people love to fill out. Boost response rates with conversational design, logic jumps, and seamless integrations.',
  'Beautiful conversational forms and surveys',
  'Marketing & Growth',
  ARRAY['forms', 'surveys', 'lead-generation', 'conversion'],
  'FormBuilder',
  'https://example-formbuilder.com',
  25200, -- $252/year normally
  12600, -- $126/year with deal (50% off)
  90,
  90,
  'discount',
  NOW() + INTERVAL '12 days',
  'live',
  'free',
  false
);

-- Add some price history for testing price drop alerts
INSERT INTO deal_price_history (deal_id, original_price, deal_price, discount_percentage, price_change_reason)
SELECT 
  id,
  original_price,
  deal_price,
  discount_percentage,
  'initial_listing'
FROM deals 
WHERE slug IN ('taskflow-pro-75-off', 'designcraft-pro-6-months-free', 'creatormail-pro-60-off');

-- Initialize user preferences for testing users
INSERT INTO user_preferences (user_id, preferred_categories, min_discount_threshold, max_budget, email_deal_alerts, email_price_drops)
SELECT 
  id,
  ARRAY['Productivity & Organization', 'Design & Creative', 'Marketing & Growth'],
  25,
  20000, -- $200 budget
  true,
  true
FROM profiles 
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE user_id IS NOT NULL)
LIMIT 5;

COMMENT ON EXTENSION postgres_fdw IS 'Sample deals created for testing psychological features with FICTIONAL SaaS tools for safe testing';