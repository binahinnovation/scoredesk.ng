/*
  # Enforce School-Level Data Isolation

  This migration adds comprehensive Row Level Security (RLS) policies to ensure
  complete data separation between schools. Each school should only access their own data.

  ## Changes

  1. Update RLS policies for all tables to enforce school_id filtering
  2. Ensure users can only see data from their own school
  3. Maintain super admin access for system management

  ## Tables Affected
  - students
  - results
  - classes
  - subjects
  - assessments
  - terms
  - scratch_cards
  - attendance
  - question_papers
  - profiles (users)
  - user_roles

  ## Security Strategy
  - All queries automatically filter by authenticated user's school_id
  - Super admins can bypass restrictions for system management
  - Row-level security prevents data leakage between schools
*/

-- Helper function to get current user's school_id
CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_school_id UUID;
BEGIN
  SELECT school_id INTO user_school_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_school_id;
END;
$$;

-- ============================================================================
-- STUDENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view students from their school" ON public.students;
DROP POLICY IF EXISTS "Users can insert students for their school" ON public.students;
DROP POLICY IF EXISTS "Users can update students from their school" ON public.students;
DROP POLICY IF EXISTS "Users can delete students from their school" ON public.students;

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- New policies with school isolation
CREATE POLICY "Users can view students from their school"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id() OR
    is_current_user_principal()
  );

CREATE POLICY "Users can insert students for their school"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update students from their school"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete students from their school"
  ON public.students
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    is_current_user_principal()
  );

-- ============================================================================
-- RESULTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view results from their school" ON public.results;
DROP POLICY IF EXISTS "Users can insert results for their school" ON public.results;
DROP POLICY IF EXISTS "Users can update results from their school" ON public.results;
DROP POLICY IF EXISTS "Users can delete results from their school" ON public.results;

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view results from their school"
  ON public.results
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert results for their school"
  ON public.results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update results from their school"
  ON public.results
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete results from their school"
  ON public.results
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id() AND
    is_current_user_principal()
  );

-- ============================================================================
-- CLASSES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view classes from their school" ON public.classes;
DROP POLICY IF EXISTS "Users can insert classes for their school" ON public.classes;
DROP POLICY IF EXISTS "Users can update classes from their school" ON public.classes;
DROP POLICY IF EXISTS "Users can delete classes from their school" ON public.classes;

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view classes from their school"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert classes for their school"
  ON public.classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update classes from their school"
  ON public.classes
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete classes from their school"
  ON public.classes
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- SUBJECTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view subjects from their school" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert subjects for their school" ON public.subjects;
DROP POLICY IF EXISTS "Users can update subjects from their school" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete subjects from their school" ON public.subjects;

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subjects from their school"
  ON public.subjects
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert subjects for their school"
  ON public.subjects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update subjects from their school"
  ON public.subjects
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete subjects from their school"
  ON public.subjects
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- ASSESSMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view assessments from their school" ON public.assessments;
DROP POLICY IF EXISTS "Users can insert assessments for their school" ON public.assessments;
DROP POLICY IF EXISTS "Users can update assessments from their school" ON public.assessments;
DROP POLICY IF EXISTS "Users can delete assessments from their school" ON public.assessments;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assessments from their school"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert assessments for their school"
  ON public.assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update assessments from their school"
  ON public.assessments
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete assessments from their school"
  ON public.assessments
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- TERMS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view terms from their school" ON public.terms;
DROP POLICY IF EXISTS "Users can insert terms for their school" ON public.terms;
DROP POLICY IF EXISTS "Users can update terms from their school" ON public.terms;
DROP POLICY IF EXISTS "Users can delete terms from their school" ON public.terms;

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view terms from their school"
  ON public.terms
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert terms for their school"
  ON public.terms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update terms from their school"
  ON public.terms
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete terms from their school"
  ON public.terms
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- SCRATCH CARDS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view scratch_cards from their school" ON public.scratch_cards;
DROP POLICY IF EXISTS "Users can insert scratch_cards for their school" ON public.scratch_cards;
DROP POLICY IF EXISTS "Users can update scratch_cards from their school" ON public.scratch_cards;
DROP POLICY IF EXISTS "Users can delete scratch_cards from their school" ON public.scratch_cards;

ALTER TABLE public.scratch_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scratch_cards from their school"
  ON public.scratch_cards
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert scratch_cards for their school"
  ON public.scratch_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update scratch_cards from their school"
  ON public.scratch_cards
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete scratch_cards from their school"
  ON public.scratch_cards
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- ATTENDANCE TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view attendance from their school" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert attendance for their school" ON public.attendance;
DROP POLICY IF EXISTS "Users can update attendance from their school" ON public.attendance;
DROP POLICY IF EXISTS "Users can delete attendance from their school" ON public.attendance;

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attendance from their school"
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert attendance for their school"
  ON public.attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update attendance from their school"
  ON public.attendance
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete attendance from their school"
  ON public.attendance
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- QUESTION PAPERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view question_papers from their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can insert question_papers for their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can update question_papers from their school" ON public.question_papers;
DROP POLICY IF EXISTS "Users can delete question_papers from their school" ON public.question_papers;

ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view question_papers from their school"
  ON public.question_papers
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can insert question_papers for their school"
  ON public.question_papers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can update question_papers from their school"
  ON public.question_papers
  FOR UPDATE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  )
  WITH CHECK (
    school_id = get_current_user_school_id()
  );

CREATE POLICY "Users can delete question_papers from their school"
  ON public.question_papers
  FOR DELETE
  TO authenticated
  USING (
    school_id = get_current_user_school_id()
  );

-- ============================================================================
-- PROFILES TABLE POLICIES (Users can only see profiles from their school)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view profiles from their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles from their school"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id() OR
    id = auth.uid() OR
    is_current_user_principal()
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid()
  );

-- ============================================================================
-- USER_ROLES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view user_roles from their school" ON public.user_roles;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view user_roles from their school"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    school_id = get_current_user_school_id() OR
    user_id = auth.uid() OR
    is_current_user_principal()
  );

-- Note: Insert/Update/Delete policies for user_roles remain with Principal restrictions
-- as defined in previous migrations

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.get_current_user_school_id() TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_current_user_school_id() IS 
'Returns the school_id of the currently authenticated user. Used for RLS policies to enforce school-level data isolation.';

