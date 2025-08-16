-- Create feedback_upvotes table to track upvotes on feedback submissions
-- This script should be run in your Supabase SQL editor

-- Create the feedback_upvotes table
CREATE TABLE IF NOT EXISTS feedback_upvotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feedback_submission_id UUID NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a user can only upvote a feedback submission once
    UNIQUE(feedback_submission_id, user_id)
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_submission_id ON feedback_upvotes(feedback_submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_user_id ON feedback_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_upvotes_created_at ON feedback_upvotes(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE feedback_upvotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all upvotes" ON feedback_upvotes
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own upvotes" ON feedback_upvotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON feedback_upvotes
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create a function to get upvote counts (for better performance)
CREATE OR REPLACE FUNCTION get_feedback_upvote_count(submission_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM feedback_upvotes
        WHERE feedback_submission_id = submission_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_feedback_upvote_count TO authenticated, anon;

COMMENT ON TABLE feedback_upvotes IS 'Tracks user upvotes on feedback submissions';
COMMENT ON COLUMN feedback_upvotes.feedback_submission_id IS 'Reference to the feedback submission being upvoted';
COMMENT ON COLUMN feedback_upvotes.user_id IS 'Reference to the user who upvoted';
COMMENT ON COLUMN feedback_upvotes.created_at IS 'When the upvote was created';
