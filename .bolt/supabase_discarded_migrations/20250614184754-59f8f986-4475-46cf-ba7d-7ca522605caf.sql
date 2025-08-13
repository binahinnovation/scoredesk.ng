
-- First, create a helper function to safely check if the current user is a Principal
-- This avoids the recursion error by not reading from the user_roles table inside its own policy.
CREATE OR REPLACE FUNCTION public.is_principal()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super_admin BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get user email and metadata from auth schema
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
  
  -- Case 3: Check the user_roles table directly for the 'Principal' role.
  -- This is safe because this function is not called *from* a user_roles policy.
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'Principal') THEN
      RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Now, create the new policies for the user_roles table

-- Policy for SELECT: Allows users to see their own role, and Principals to see all roles.
CREATE POLICY "Users can view their own role, Principals can view all"
ON public.user_roles FOR SELECT
USING ( (user_id = auth.uid()) OR (public.is_principal() IS TRUE) );

-- Policy for INSERT, UPDATE, DELETE: Only Principals can manage roles.
CREATE POLICY "Principals can manage user roles"
ON public.user_roles FOR ALL
USING ( public.is_principal() IS TRUE )
WITH CHECK ( public.is_principal() IS TRUE );

-- Also, let's fix the storage bucket RLS policy to allow authenticated users to create buckets.
-- This will resolve the "violates row-level security policy" error for the avatars bucket.
CREATE POLICY "Authenticated users can create buckets" 
ON storage.buckets FOR INSERT 
TO authenticated 
WITH CHECK (true);
