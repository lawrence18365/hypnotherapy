-- Feedback System Tables for LaunchBoost
-- Run this SQL in your Supabase SQL Editor to create the feedback system

-- Create feedback_submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('feature_request', 'improvement', 'bug_report', 'question')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'open', 'in_progress', 'completed', 'closed', 'wont_fix')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  deal_reference TEXT,
  contact_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback_upvotes table for voting system
CREATE TABLE IF NOT EXISTS feedback_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feedback_submission_id UUID REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_submission_id, user_id)
);

-- Create RLS (Row Level Security) policies
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can read feedback submissions (public access)
CREATE POLICY "Anyone can read feedback submissions" ON feedback_submissions
  FOR SELECT USING (true);

-- Authenticated users can create feedback submissions
CREATE POLICY "Authenticated users can create feedback" ON feedback_submissions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Users can update their own feedback submissions
CREATE POLICY "Users can update own feedback" ON feedback_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can read upvotes (for public display)
CREATE POLICY "Anyone can read upvotes" ON feedback_upvotes
  FOR SELECT USING (true);

-- Authenticated users can create upvotes
CREATE POLICY "Authenticated users can upvote" ON feedback_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes" ON feedback_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_status ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_type ON feedback_submissions(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_submissions_created_at ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_submission_id ON feedback_upvotes(feedback_submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_user_id ON feedback_upvotes(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_feedback_submissions_updated_at
  BEFORE UPDATE ON feedback_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample feedback data for testing
INSERT INTO feedback_submissions (
  subject,
  message,
  feedback_type,
  status,
  contact_name,
  contact_email
) VALUES 
(
  'Add dark mode support',
  'It would be great to have a dark mode option for the platform. Many users prefer dark themes, especially when browsing in low-light environments.',
  'feature_request',
  'open',
  'John Doe',
  'john@example.com'
),
(
  'Improve deal loading speed',
  'The deal pages sometimes take a while to load. It would be great if this could be optimized for a better user experience.',
  'improvement',
  'in_progress',
  'Jane Smith',
  'jane@example.com'
),
(
  'Search functionality not working on mobile',
  'When I try to search for deals on my mobile device, the search doesn''t seem to work properly. It might be a responsive design issue.',
  'bug_report',
  'new',
  'Mike Johnson',
  'mike@example.com'
),
(
  'How to export deal data?',
  'Is there a way to export my submitted deals data? I need this information for my records.',
  'question',
  'open',
  'Sarah Wilson',
  'sarah@example.com'
),
(
  'Add email notifications for new deals',
  'Would love to get email notifications when new deals are posted in categories I''m interested in.',
  'feature_request',
  'open',
  'Alex Brown',
  'alex@example.com'
);
