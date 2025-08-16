-- Fix Row Level Security policies for feedback system

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('feedback_submissions', 'feedback_upvotes');

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Anyone can read feedback submissions" ON feedback_submissions;
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON feedback_submissions;
DROP POLICY IF EXISTS "Users can update own feedback" ON feedback_submissions;
DROP POLICY IF EXISTS "Anyone can read upvotes" ON feedback_upvotes;
DROP POLICY IF EXISTS "Authenticated users can upvote" ON feedback_upvotes;
DROP POLICY IF EXISTS "Users can delete own upvotes" ON feedback_upvotes;

-- Create new working policies for feedback_submissions
CREATE POLICY "Public can read all feedback submissions" ON feedback_submissions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create feedback submissions" ON feedback_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own feedback" ON feedback_submissions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create new working policies for feedback_upvotes  
CREATE POLICY "Public can read all upvotes" ON feedback_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create upvotes" ON feedback_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON feedback_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('feedback_submissions', 'feedback_upvotes');