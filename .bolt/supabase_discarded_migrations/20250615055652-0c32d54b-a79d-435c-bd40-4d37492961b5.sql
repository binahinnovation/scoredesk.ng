
CREATE OR REPLACE FUNCTION public.get_manageable_users()
RETURNS TABLE(id uuid, user_id uuid, role text, full_name text, school_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function checks if the current user is a principal.
  -- If so, it returns all users. Otherwise, it returns only their own record.
  -- As a SECURITY DEFINER function, it bypasses the RLS policies causing the recursion.
  IF public.is_current_user_principal() THEN
    -- User is a principal, return all user roles and their profiles.
    RETURN QUERY
    SELECT
      ur.id,
      ur.user_id,
      ur.role,
      p.full_name,
      p.school_name
    FROM
      public.user_roles ur
    LEFT JOIN
      public.profiles p ON ur.user_id = p.id;
  ELSE
    -- User is not a principal, return only their own user role and profile.
    RETURN QUERY
    SELECT
      ur.id,
      ur.user_id,
      ur.role,
      p.full_name,
      p.school_name
    FROM
      public.user_roles ur
    LEFT JOIN
      public.profiles p ON ur.user_id = p.id
    WHERE
      ur.user_id = auth.uid();
  END IF;
END;
$$;
