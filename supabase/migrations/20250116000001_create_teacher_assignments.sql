/*
  # Create Teacher Assignments Table
  
  This migration creates a proper table structure for managing teacher assignments
  to multiple subjects and classes, replacing the current user_metadata approach.
  
  ## Changes
  1. Create teacher_assignments table for proper relational data
  2. Create indexes for performance
  3. Add RLS policies for school isolation
  4. Create helper functions for teacher assignment queries
*/

-- Create teacher_assignments table
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of teacher, subject, and class
  UNIQUE(teacher_id, subject_id, class_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_id ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_subject_id ON public.teacher_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class_id ON public.teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_id ON public.teacher_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_active ON public.teacher_assignments(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view teacher_assignments from their school" ON public.teacher_assignments;
DROP POLICY IF EXISTS "Principals can manage teacher_assignments for their school" ON public.teacher_assignments;

-- RLS Policies for school isolation
CREATE POLICY "Users can view teacher_assignments from their school"
  ON public.teacher_assignments
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id() OR
    teacher_id = auth.uid()
  );

CREATE POLICY "Principals can manage teacher_assignments for their school"
  ON public.teacher_assignments
  FOR ALL
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND is_current_user_principal()
  )
  WITH CHECK (
    school_id = get_current_user_school_id() AND is_current_user_principal()
  );

-- Helper function to get teacher's assigned subjects
CREATE OR REPLACE FUNCTION public.get_teacher_subjects(teacher_id_param UUID)
RETURNS TABLE(subject_id UUID, subject_name TEXT, subject_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT s.id, s.name, s.code
  FROM public.teacher_assignments ta
  JOIN public.subjects s ON ta.subject_id = s.id
  WHERE ta.teacher_id = teacher_id_param 
    AND ta.is_active = TRUE
    AND s.school_id = get_current_user_school_id()
  ORDER BY s.name;
END;
$$;

-- Helper function to get teacher's assigned classes
CREATE OR REPLACE FUNCTION public.get_teacher_classes(teacher_id_param UUID)
RETURNS TABLE(class_id UUID, class_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id, c.name
  FROM public.teacher_assignments ta
  JOIN public.classes c ON ta.class_id = c.id
  WHERE ta.teacher_id = teacher_id_param 
    AND ta.is_active = TRUE
    AND c.school_id = get_current_user_school_id()
  ORDER BY c.name;
END;
$$;

-- Helper function to check if teacher is assigned to a subject-class combination
CREATE OR REPLACE FUNCTION public.is_teacher_assigned_to_subject_class(
  teacher_id_param UUID,
  subject_id_param UUID,
  class_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM public.teacher_assignments 
    WHERE teacher_id = teacher_id_param 
      AND subject_id = subject_id_param 
      AND class_id = class_id_param 
      AND is_active = TRUE
      AND school_id = get_current_user_school_id()
  );
END;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.teacher_assignments TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_teacher_subjects(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_teacher_classes(UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_teacher_assigned_to_subject_class(UUID, UUID, UUID) TO postgres, anon, authenticated, service_role;

-- Add comments
COMMENT ON TABLE public.teacher_assignments IS 'Stores teacher assignments to subjects and classes with proper relational structure';
COMMENT ON FUNCTION public.get_teacher_subjects(UUID) IS 'Returns all subjects assigned to a teacher';
COMMENT ON FUNCTION public.get_teacher_classes(UUID) IS 'Returns all classes assigned to a teacher';
COMMENT ON FUNCTION public.is_teacher_assigned_to_subject_class(UUID, UUID, UUID) IS 'Checks if a teacher is assigned to a specific subject-class combination';
