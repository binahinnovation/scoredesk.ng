/*
  # Create Attendance Management System

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `school_id` (uuid, references schools)
      - `class_id` (uuid, references classes)
      - `student_id` (uuid, references students)
      - `date` (date)
      - `period` (text, optional)
      - `status` (attendance_status enum)
      - `note` (text, optional)
      - `recorded_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. New Types
    - `attendance_status` enum ('present', 'absent', 'late')

  3. Security
    - Enable RLS on `attendance` table
    - Add policies for same-school access
    - Teachers can record attendance
    - Principals/Exam Officers can manage all attendance

  4. Indexes
    - Performance indexes for common queries
*/

-- Create attendance status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
  END IF;
END $$;

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  period text,
  status attendance_status NOT NULL,
  note text,
  recorded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint separately to avoid syntax issues
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'attendance_unique_student_date_period'
  ) THEN
    ALTER TABLE public.attendance 
    ADD CONSTRAINT attendance_unique_student_date_period 
    UNIQUE (student_id, date, period);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance (class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON public.attendance (school_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_recorded_by ON public.attendance (recorded_by);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance table
-- SELECT: Users can view attendance records from their school
CREATE POLICY "attendance_select_same_school"
ON public.attendance FOR SELECT
USING (
  school_id IN (
    SELECT school_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- INSERT: Teachers can record attendance for their school
CREATE POLICY "attendance_insert_teachers"
ON public.attendance FOR INSERT
WITH CHECK (
  recorded_by = auth.uid()
  AND school_id IN (
    SELECT school_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- UPDATE: Only the person who recorded it, or Principals/Exam Officers can update
CREATE POLICY "attendance_update_authorized"
ON public.attendance FOR UPDATE
USING (
  recorded_by = auth.uid()
  OR is_current_user_principal()
  OR (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
  ) = 'Exam Officer'
);

-- DELETE: Only the person who recorded it, or Principals/Exam Officers can delete
CREATE POLICY "attendance_delete_authorized"
ON public.attendance FOR DELETE
USING (
  recorded_by = auth.uid()
  OR is_current_user_principal()
  OR (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
  ) = 'Exam Officer'
);

-- Principals have full access to all attendance records
CREATE POLICY "attendance_principal_full_access"
ON public.attendance FOR ALL
USING (is_current_user_principal())
WITH CHECK (is_current_user_principal());

-- Add updated_at trigger
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();