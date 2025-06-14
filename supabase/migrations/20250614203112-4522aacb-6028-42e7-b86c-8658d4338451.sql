
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
  -- This is safe as it queries auth.users, not the user_roles table itself.
  SELECT email, (raw_user_meta_data->>'is_super_admin')::boolean
  INTO user_email, is_super_admin
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Case 1: User was marked as a super admin during signup.
  IF is_super_admin IS TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- Case 2: User email is one of the hardcoded super admin emails.
  IF user_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
    RETURN TRUE;
  END IF;
  
  -- NOTE: The direct check on the 'user_roles' table has been removed.
  -- Previously, this function would check:
  -- IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'Principal') THEN RETURN TRUE; END IF;
  -- This caused an "infinite recursion" error because the RLS policy on 'user_roles' was calling this function,
  -- which in turn was querying 'user_roles', creating a loop.
  -- From now on, a user is considered a 'Principal' for RLS purposes only if they meet the conditions above (super_admin flag or hardcoded email).

  RETURN FALSE;
END;
$$;
