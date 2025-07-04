-- Fix ambiguous column reference in get_manageable_users function
CREATE OR REPLACE FUNCTION public.get_manageable_users()
RETURNS TABLE(id uuid, user_id uuid, role text, full_name text, school_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_role text;
  current_user_school_id uuid;
  is_super_admin boolean;
  current_user_email text;
BEGIN
  -- Get current user details
  SELECT 
    u.email,
    (u.raw_user_meta_data->>'is_super_admin')::boolean
  INTO 
    current_user_email,
    is_super_admin
  FROM auth.users u
  WHERE u.id = auth.uid();

  -- Check if user is super admin
  IF is_super_admin IS TRUE OR current_user_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
    -- Super admins can see all users
    RETURN QUERY
    SELECT 
      COALESCE(ur.id, gen_random_uuid()) as id,
      p.id as user_id,
      COALESCE(ur.role::text, public.get_user_role(p.id)) as role,
      p.full_name,
      p.school_name
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    ORDER BY p.full_name;
    
    RETURN;
  END IF;

  -- Get current user's role and school
  SELECT 
    public.get_user_role(auth.uid()),
    p.school_id
  INTO 
    current_user_role,
    current_user_school_id
  FROM public.profiles p
  WHERE p.id = auth.uid();

  -- If user is a Principal, return users from their school
  IF current_user_role = 'Principal' THEN
    RETURN QUERY
    SELECT 
      COALESCE(ur.id, gen_random_uuid()) as id,
      p.id as user_id,
      COALESCE(ur.role::text, public.get_user_role(p.id)) as role,
      p.full_name,
      p.school_name
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE p.school_id = current_user_school_id OR current_user_school_id IS NULL
    ORDER BY p.full_name;
  ELSE
    -- Non-principals can only see their own data
    RETURN QUERY
    SELECT 
      COALESCE(ur.id, gen_random_uuid()) as id,
      p.id as user_id,
      COALESCE(ur.role::text, public.get_user_role(p.id)) as role,
      p.full_name,
      p.school_name
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE p.id = auth.uid()
    ORDER BY p.full_name;
  END IF;
END;
$function$