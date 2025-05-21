
-- Function to get user role without TypeScript errors
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = user_id_param
  LIMIT 1;
  
  RETURN user_role;
END;
$$;
