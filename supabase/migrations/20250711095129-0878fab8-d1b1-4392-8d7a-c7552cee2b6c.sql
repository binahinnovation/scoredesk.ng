-- Fix RLS policies for question papers to handle school_id properly
-- Update question_papers policies to allow teachers to submit without requiring school_id

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Teachers can create their own question papers" ON public.question_papers;
DROP POLICY IF EXISTS "Teachers can update their own question papers" ON public.question_papers;
DROP POLICY IF EXISTS "Teachers can view their own question papers" ON public.question_papers;

-- Create more permissive policies for teachers
CREATE POLICY "Teachers can create their own question papers" 
ON public.question_papers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own question papers" 
ON public.question_papers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = teacher_id AND status IN ('Draft', 'Submitted'));

CREATE POLICY "Teachers can view their own question papers" 
ON public.question_papers 
FOR SELECT 
TO authenticated
USING (auth.uid() = teacher_id);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;

-- Create new storage policies for documents bucket
CREATE POLICY "Authenticated users can upload to documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'documents');

-- Add scratch card usage tracking to prevent reuse
ALTER TABLE public.scratch_cards 
ADD COLUMN IF NOT EXISTS used_for_result_check boolean DEFAULT false;

-- Update scratch card when used for result checking
CREATE OR REPLACE FUNCTION public.mark_scratch_card_used(card_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.scratch_cards 
  SET used_for_result_check = true,
      used_at = now(),
      used_by = auth.uid()
  WHERE pin = card_pin 
    AND status = 'Active' 
    AND used_for_result_check = false;
  
  RETURN FOUND;
END;
$$;