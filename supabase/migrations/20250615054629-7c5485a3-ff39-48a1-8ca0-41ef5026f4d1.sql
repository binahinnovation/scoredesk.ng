
-- First, let's drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own role, Principals can view all" ON public.user_roles;
DROP POLICY IF EXISTS "Principals can manage user roles" ON public.user_roles;

-- Create a safer function that completely avoids any table recursion
CREATE OR REPLACE FUNCTION public.is_current_user_principal()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super_admin BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get user email and metadata from auth schema only
  SELECT email, (raw_user_meta_data->>'is_super_admin')::boolean
  INTO user_email, is_super_admin
  FROM auth.users
  WHERE id = auth.uid();

  -- Case 1: User was marked as super admin during signup
  IF is_super_admin IS TRUE THEN
    RETURN TRUE;
  END IF;

  -- Case 2: User email is one of the hardcoded super admin emails
  IF user_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Now create new, safer policies
CREATE POLICY "Users can view own role or principals view all"
ON public.user_roles FOR SELECT
USING (
  user_id = auth.uid() OR public.is_current_user_principal()
);

CREATE POLICY "Only principals can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_current_user_principal());

CREATE POLICY "Only principals can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_current_user_principal())
WITH CHECK (public.is_current_user_principal());

CREATE POLICY "Only principals can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_current_user_principal());
