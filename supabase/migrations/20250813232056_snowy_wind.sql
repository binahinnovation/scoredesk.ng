/*
  # Add Audit Trail System

  1. New Tables
    - `edit_logs`
      - `id` (uuid, primary key)
      - `school_id` (uuid, references schools)
      - `actor_id` (uuid, references profiles)
      - `action_type` (text, check constraint)
      - `table_name` (text)
      - `record_id` (uuid)
      - `old_value` (jsonb)
      - `new_value` (jsonb)
      - `reason` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `edit_logs` table
    - Add policy for Principals and Exam Officers to view logs within their school
    - Create helper function `fn_log_edit` for secure logging
    - Create helper function `is_current_user_exam_officer` for role checking

  3. Indexes
    - Optimized indexes for filtering by school, table, actor, and date
*/

-- Create the edit_logs table
CREATE TABLE IF NOT EXISTS public.edit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES public.profiles(id), -- who did it
  action_type text NOT NULL CHECK (action_type IN ('insert','update','delete')),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_edit_logs_school_table_created ON public.edit_logs (school_id, table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edit_logs_actor_created ON public.edit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edit_logs_record_id ON public.edit_logs (record_id);
CREATE INDEX IF NOT EXISTS idx_edit_logs_table_name ON public.edit_logs (table_name);

-- Enable Row Level Security on the edit_logs table
ALTER TABLE public.edit_logs ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if current user is Exam Officer
CREATE OR REPLACE FUNCTION public.is_current_user_exam_officer()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  RETURN user_role = 'Exam Officer';
END;
$$;

-- RLS Policy for edit_logs: Only Principals and Exam Officers within the same school can view logs
CREATE POLICY "logs_visible_to_admins"
ON public.edit_logs FOR SELECT
USING (
  school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
  AND (
    public.get_user_role(auth.uid()) = 'Principal'
    OR public.get_user_role(auth.uid()) = 'Exam Officer'
  )
);

-- Create the RPC helper function to write logs
CREATE OR REPLACE FUNCTION public.fn_log_edit(
  p_school_id uuid,
  p_actor_id uuid,
  p_action text,
  p_table text,
  p_record uuid,
  p_old jsonb,
  p_new jsonb,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.edit_logs
    (school_id, actor_id, action_type, table_name, record_id, old_value, new_value, reason)
  VALUES (p_school_id, p_actor_id, p_action, p_table, p_record, p_old, p_new, p_reason);
END;
$$;

-- Grant execute permission on the RPC function to authenticated users
GRANT EXECUTE ON FUNCTION public.fn_log_edit(uuid, uuid, text, text, uuid, jsonb, jsonb, text) TO authenticated;