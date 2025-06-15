
CREATE OR REPLACE FUNCTION public.is_principal()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_super_admin BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get user email and metadata from auth schema. This is safe as it
  -- queries auth.users, not the user_roles table itself, thus avoiding recursion.
  SELECT email, (raw_user_meta_data->>'is_super_admin')::boolean
  INTO user_email, is_super_admin
  FROM auth.users
  WHERE id = auth.uid();

  -- Case 1: The user was marked as a super admin during signup.
  IF is_super_admin IS TRUE THEN
    RETURN TRUE;
  END IF;

  -- Case 2: The user's email is one of the hardcoded super admin emails.
  IF user_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
    RETURN TRUE;
  END IF;

  -- A user is only considered a 'Principal' for this security check if one of the above conditions is met.
  -- Do NOT check the user_roles table here—avoids infinite recursion.
  RETURN FALSE;
END;
$$;
