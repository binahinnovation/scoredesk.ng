
CREATE OR REPLACE FUNCTION public.get_manageable_users()
RETURNS TABLE(id uuid, user_id uuid, role text, full_name text, school_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_current_user_principal() THEN
    -- User is a principal, return all profiles and their associated role.
    -- We start from `profiles` to ensure all users are included, even without a role.
    RETURN QUERY
    SELECT
      p.id, -- Use profile id (which is the user_id) as the unique key for the row.
      p.id AS user_id,
      COALESCE(ur.role, 'No Role Assigned') AS role,
      p.full_name,
      p.school_name
    FROM
      public.profiles p
    LEFT JOIN
      public.user_roles ur ON p.id = ur.user_id;
  ELSE
    -- User is not a principal, return only their own profile and role.
    RETURN QUERY
    SELECT
      p.id,
      p.id AS user_id,
      COALESCE(ur.role, 'No Role Assigned') AS role,
      p.full_name,
      p.school_name
    FROM
      public.profiles p
    LEFT JOIN
      public.user_roles ur ON p.id = ur.user_id
    WHERE
      p.id = auth.uid();
  END IF;
END;
$$;
