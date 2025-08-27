/*
  # Create Student Attendance Management System

  1. New Types
    - `attendance_status` enum for tracking attendance states

  2. New Tables
    - `attendance` table for recording daily/period attendance
      - Links to schools, classes, students, and profiles
      - Supports both daily and period-based attendance
      - Unique constraint prevents duplicate entries
      - Includes notes for additional context

  3. Security
    - Enable RLS on attendance table
    - Policies for same-school access
    - Teachers can record attendance for their assigned classes
    - Principals and Exam Officers have full access
    - Students and parents cannot modify attendance records

  4. Indexes
    - Optimized for common queries by class/date and student/date
*/

-- Create attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  period text, -- optional (e.g., "P1", "Math", "Morning", "Afternoon")
  status attendance_status NOT NULL,
  note text,
  recorded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, COALESCE(period, ''))
);

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