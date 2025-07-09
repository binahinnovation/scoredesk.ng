-- First, update any existing Mid-Term Test assessments to Continuous Assessment
UPDATE public.assessments 
SET type = 'Continuous Assessment' 
WHERE type = 'Mid-Term Test';

-- Now safely remove Mid-Term Test from assessment types
ALTER TYPE assessment_type RENAME TO assessment_type_old;
CREATE TYPE assessment_type AS ENUM ('Continuous Assessment', 'End of Term Exam');
ALTER TABLE assessments ALTER COLUMN type TYPE assessment_type USING type::text::assessment_type;
DROP TYPE assessment_type_old;

-- Create question_papers table for the new feature
CREATE TABLE public.question_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  term_id UUID NOT NULL REFERENCES terms(id),
  title TEXT NOT NULL,
  submission_mode TEXT NOT NULL CHECK (submission_mode IN ('scan', 'manual')),
  content JSONB, -- For manual mode questions
  file_url TEXT, -- For scanned papers
  pdf_url TEXT, -- Generated PDF URL
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  school_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on question_papers
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;

-- RLS policies for question_papers
CREATE POLICY "Teachers can view their own question papers" 
ON public.question_papers 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create their own question papers" 
ON public.question_papers 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own question papers" 
ON public.question_papers 
FOR UPDATE 
USING (auth.uid() = teacher_id AND status = 'Draft');

CREATE POLICY "Principals can manage all question papers" 
ON public.question_papers 
FOR ALL 
USING (is_current_user_principal());

-- Add settings for customizable assessment weights and grade boundaries
INSERT INTO public.settings (setting_key, setting_value) VALUES 
('assessment_weights', '{"ca1": 20, "ca2": 20, "exam": 60}'),
('grade_boundaries', '{"A": {"min": 80, "max": 100}, "B": {"min": 70, "max": 79}, "C": {"min": 60, "max": 69}, "D": {"min": 50, "max": 59}, "F": {"min": 0, "max": 49}}');

-- Create trigger for question_papers updated_at
CREATE TRIGGER update_question_papers_updated_at
BEFORE UPDATE ON public.question_papers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();