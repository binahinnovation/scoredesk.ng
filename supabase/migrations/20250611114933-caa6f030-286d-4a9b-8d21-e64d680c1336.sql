
-- Create a super admin user with email and password
-- First, let's create a function to create a super admin user
CREATE OR REPLACE FUNCTION create_super_admin(admin_email text, admin_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Insert user into auth.users (this is a simplified approach)
  -- In production, you'd use Supabase Auth API
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'full_name', 'Super Administrator',
      'school_name', 'ScoreDesk Admin',
      'is_super_admin', true
    ),
    true
  ) RETURNING id INTO new_user_id;

  -- Create profile for the super admin
  INSERT INTO public.profiles (id, full_name, school_name)
  VALUES (new_user_id, 'Super Administrator', 'ScoreDesk Admin');

  -- Assign Principal role to super admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'Principal');

  result := json_build_object(
    'success', true,
    'message', 'Super admin created successfully',
    'user_id', new_user_id,
    'email', admin_email
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', 'Error creating super admin: ' || SQLERRM
  );
END;
$$;

-- Create the super admin account
SELECT create_super_admin('superadmin@scoredesk.com', 'Admin@2024!');

-- Update the get_user_role function to better handle super admin detection
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  is_super_admin BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id_param;
  
  -- Check if user is marked as super admin in auth.users
  SELECT COALESCE((raw_user_meta_data->>'is_super_admin')::boolean, false) INTO is_super_admin
  FROM auth.users
  WHERE id = user_id_param;
  
  -- If marked as super admin, return 'Principal' role
  IF is_super_admin IS TRUE THEN
    RETURN 'Principal';
  END IF;
  
  -- Check for hardcoded super admin emails
  IF user_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
    RETURN 'Principal';
  END IF;
  
  -- Get the normal role from user_roles table
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = user_id_param
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'Subject Teacher');
END;
$$;
