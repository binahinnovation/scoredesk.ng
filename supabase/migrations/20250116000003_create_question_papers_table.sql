/*
  # Create Question Papers Management System

  1. New Table
    - `question_papers`
      - `id` (uuid, primary key)
      - `school_id` (uuid, references schools)
      - `teacher_id` (uuid, references profiles)
      - `subject_id` (uuid, references subjects)
      - `class_id` (uuid, references classes)
      - `term_id` (uuid, references terms)
      - `title` (text, not null)
      - `submission_mode` (text, 'scan' or 'manual')
      - `content` (jsonb, for manual mode questions)
      - `file_url` (text, for scanned papers)
      - `pdf_url` (text, generated PDF URL)
      - `status` (text, 'Draft', 'Submitted', 'Approved', 'Rejected')
      - `submitted_at` (timestamptz)
      - `approved_by` (uuid, references profiles)
      - `approved_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `question_papers` table
    - Add policies for school isolation
    - Teachers can manage their own papers
    - Principals/Exam Officers can manage all papers

  3. Indexes
    - Performance indexes for common queries
*/

-- Create question_papers table
CREATE TABLE IF NOT EXISTS public.question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  title text NOT NULL,
  submission_mode text NOT NULL CHECK (submission_mode IN ('scan', 'manual')),
  content jsonb, -- For manual mode questions
  file_url text, -- For scanned papers
  pdf_url text, -- Generated PDF URL
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  submitted_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate papers
ALTER TABLE public.question_papers 
ADD CONSTRAINT unique_paper_per_teacher_subject_class_term 
UNIQUE (teacher_id, subject_id, class_id, term_id, title);

-- Enable RLS
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view question_papers from their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can insert question_papers for their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can update question_papers from their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can delete question_papers from their school" ON public.question_papers;
DROP POLICY IF EXISTS "Teachers can create question_papers for their school" ON public.question_papers;
DROP POLICY IF EXISTS "Teachers can update their own question_papers" ON public.question_papers;
DROP POLICY IF EXISTS "Principals and Exam Officers can manage all question_papers" ON public.question_papers;

-- RLS Policies for school isolation
CREATE POLICY "Users can view question_papers from their school"
  ON public.question_papers
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Teachers can create question_papers for their school"
  ON public.question_papers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id() AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Teachers can update their own question_papers"
  ON public.question_papers
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    teacher_id = auth.uid() AND
    status IN ('Draft', 'Rejected')
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND
    teacher_id = auth.uid()
  );

CREATE POLICY "Principals and Exam Officers can manage all question_papers"
  ON public.question_papers
  FOR ALL
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    (is_current_user_principal() OR is_current_user_exam_officer())
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND
    (is_current_user_principal() OR is_current_user_exam_officer())
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_papers_school_id ON public.question_papers (school_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_teacher_id ON public.question_papers (teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_subject_id ON public.question_papers (subject_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_class_id ON public.question_papers (class_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_term_id ON public.question_papers (term_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_status ON public.question_papers (status);
CREATE INDEX IF NOT EXISTS idx_question_papers_created_at ON public.question_papers (created_at);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_question_papers_updated_at ON public.question_papers;

CREATE TRIGGER update_question_papers_updated_at 
  BEFORE UPDATE ON public.question_papers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
