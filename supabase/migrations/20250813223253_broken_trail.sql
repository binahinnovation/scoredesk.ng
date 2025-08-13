/*
  # Add Teacher Performance Comments to Results

  1. New Columns
    - `teacher_comment` (text) - Performance remarks from subject teachers
    - `comment_status` (text) - Approval status for comments (pending/approved/rejected)

  2. Security
    - Teachers can update their own comments
    - EO/Principal can approve/reject comments and edit if needed
    - Only approved comments show on report cards

  3. Constraints
    - Comment status must be one of: pending, approved, rejected
    - Default status is pending for new comments
*/

-- Add teacher_comment column to results table
ALTER TABLE public.results
ADD COLUMN IF NOT EXISTS teacher_comment text;

-- Add comment_status column with check constraint
ALTER TABLE public.results
ADD COLUMN IF NOT EXISTS comment_status text NOT NULL DEFAULT 'pending';

-- Add check constraint for comment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'results' AND constraint_name = 'results_comment_status_check'
  ) THEN
    ALTER TABLE public.results
    ADD CONSTRAINT results_comment_status_check 
    CHECK (comment_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Update existing RLS policies to handle comment permissions
DROP POLICY IF EXISTS "Teachers can update their own results" ON public.results;

CREATE POLICY "Teachers can update their own results"
ON public.results FOR UPDATE
USING (uid() = teacher_id)
WITH CHECK (
  uid() = teacher_id
  AND (
    -- Teachers can only update their own comments, not approve/reject them
    NEW.comment_status = OLD.comment_status
    OR NEW.comment_status = 'pending'
  )
);

-- Add policy for EO/Principal to manage comment approval
CREATE POLICY "EO and Principal can manage comment approval"
ON public.results FOR UPDATE
USING (
  is_current_user_principal()
  OR (
    SELECT role FROM public.user_roles 
    WHERE user_id = uid()
  ) = 'Exam Officer'
)
WITH CHECK (
  is_current_user_principal()
  OR (
    SELECT role FROM public.user_roles 
    WHERE user_id = uid()
  ) = 'Exam Officer'
);