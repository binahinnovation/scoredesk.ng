/*
  # Fix User Roles Table and Policies

  1. Create user_roles table if it doesn't exist
  2. Drop existing problematic policies
  3. Create new, safer policies that avoid recursion
  4. Enable RLS on the table
*/

-- First, create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('Principal', 'Exam Officer', 'Form Teacher', 'Subject Teacher')),
  school_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on the table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on user_roles (if they exist)
DROP POLICY IF EXISTS "Users can view own role or principals view all" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;

-- Create new, safer policies that avoid recursion
-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

-- Allow super admins (principals) to view all roles - using direct auth check to avoid recursion
CREATE POLICY "Super admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to insert roles - using direct auth check to avoid recursion
CREATE POLICY "Super admins can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to update roles
CREATE POLICY "Super admins can update roles" 
ON public.user_roles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to delete roles
CREATE POLICY "Super admins can delete roles" 
ON public.user_roles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);