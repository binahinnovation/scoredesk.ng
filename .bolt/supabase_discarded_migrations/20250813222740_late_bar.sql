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

  2. Security
    - Enable RLS on `attendance` table
    - Add policies for teachers to manage attendance
    - Add policies for EO/Principal to view all attendance

  3. Indexes
    - Index on (class_id, date) for efficient class attendance queries
    - Index on (student_id, date) for student attendance history
    - Index on (school_id, date) for school-wide attendance reports
</sql>

-- Create attendance status enum
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL,
  period text, -- optional (e.g., "P1", "Math")
  status attendance_status NOT NULL,
  note text,
  recorded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, COALESCE(period, ''))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance (class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON public.attendance (school_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_recorded_by ON public.attendance (recorded_by);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
CREATE POLICY "attendance_select_same_school"
ON public.attendance FOR SELECT
USING (
  school_id IN (
    SELECT school_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "attendance_insert_teacher"
ON public.attendance FOR INSERT
WITH CHECK (
  recorded_by = auth.uid()
  AND school_id IN (
    SELECT school_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "attendance_update_teacher_or_admin"
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

CREATE POLICY "attendance_delete_teacher_or_admin"
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

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();