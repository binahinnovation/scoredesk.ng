
-- Function to get user role without TypeScript errors
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  is_super_admin BOOLEAN;
BEGIN
  -- Check if user was marked as super admin during registration
  SELECT (raw_user_meta_data->>'is_super_admin')::boolean INTO is_super_admin
  FROM auth.users
  WHERE id = user_id_param;
  
  -- If marked as super admin during registration, return 'Principal' role
  IF is_super_admin IS TRUE THEN
    RETURN 'Principal';
  END IF;
  
  -- Check for hardcoded super admin emails
  SELECT 
    CASE 
      WHEN email = 'deepmindfx01@gmail.com' OR email = 'aleeyuwada01@gmail.com' THEN 'Principal'
      ELSE NULL
    END INTO user_role
  FROM auth.users
  WHERE id = user_id_param;
  
  -- If not a hardcoded super admin, get the normal role
  IF user_role IS NULL THEN
    SELECT role INTO user_role 
    FROM public.user_roles 
    WHERE user_id = user_id_param
    LIMIT 1;
  END IF;
  
  RETURN user_role;
END;
$$;
