-- Add edit tracking and auto-save functionality to question_papers table
-- This migration adds columns for tracking edits and auto-saving draft content

-- Add new columns for edit tracking
ALTER TABLE public.question_papers 
ADD COLUMN IF NOT EXISTS edit_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_edits INTEGER NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS auto_save_data JSONB,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- Update existing records to have default values
UPDATE public.question_papers 
SET 
  edit_count = 0,
  max_edits = 3,
  last_edited_at = updated_at
WHERE edit_count IS NULL OR max_edits IS NULL OR last_edited_at IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_papers_edit_count ON public.question_papers (edit_count);
CREATE INDEX IF NOT EXISTS idx_question_papers_last_edited ON public.question_papers (last_edited_at);
CREATE INDEX IF NOT EXISTS idx_question_papers_auto_save ON public.question_papers USING GIN (auto_save_data);

-- Create a function to update edit count and last_edited_at
CREATE OR REPLACE FUNCTION update_question_paper_edit_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment edit count if content actually changed
  IF OLD.content IS DISTINCT FROM NEW.content OR 
     OLD.title IS DISTINCT FROM NEW.title OR
     OLD.file_url IS DISTINCT FROM NEW.file_url THEN
    NEW.edit_count = OLD.edit_count + 1;
    NEW.last_edited_at = now();
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for edit tracking
DROP TRIGGER IF EXISTS update_question_paper_edit_tracking_trigger ON public.question_papers;

CREATE TRIGGER update_question_paper_edit_tracking_trigger
  BEFORE UPDATE ON public.question_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_paper_edit_tracking();

-- Add RLS policy for auto-save data
DROP POLICY IF EXISTS "Teachers can update their own auto-save data" ON public.question_papers;

CREATE POLICY "Teachers can update their own auto-save data"
  ON public.question_papers
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    teacher_id = auth.uid() AND
    status = 'Draft'
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND
    teacher_id = auth.uid() AND
    status = 'Draft'
  );

-- Add RLS policy for principals to modify edit limits
DROP POLICY IF EXISTS "Principals can modify edit limits" ON public.question_papers;

CREATE POLICY "Principals can modify edit limits"
  ON public.question_papers
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    is_current_user_principal()
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND
    is_current_user_principal()
  );
