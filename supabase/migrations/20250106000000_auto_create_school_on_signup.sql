/*
  # Auto-create School on User Signup

  This migration ensures that when a new user signs up:
  1. A school is automatically created for them
  2. Their profile gets assigned the school_id
  3. This fixes the "School ID not found" error

  ## Changes
  1. Create/Update trigger function to handle new user signup
  2. Automatically create school and assign school_id to profile
*/

-- Function to handle new user signup and create school
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_school_id uuid;
  school_name_value text;
  full_name_value text;
  alias_value text;
BEGIN
  -- Get school name and full name from user metadata
  school_name_value := NEW.raw_user_meta_data->>'school_name';
  full_name_value := NEW.raw_user_meta_data->>'full_name';
  
  -- If no school name provided, use email prefix or default
  IF school_name_value IS NULL OR school_name_value = '' THEN
    school_name_value := split_part(NEW.email, '@', 1) || ' School';
  END IF;
  
  -- Create alias from school name (lowercase, no spaces, max 32 chars)
  alias_value := lower(regexp_replace(school_name_value, '[^a-zA-Z0-9]', '', 'g'));
  alias_value := substring(alias_value, 1, 32);
  
  -- Create a new school for this user
  INSERT INTO public.schools (name, alias, created_by)
  VALUES (school_name_value, alias_value, NEW.id)
  RETURNING id INTO new_school_id;
  
  -- Create profile with school_id
  INSERT INTO public.profiles (id, full_name, school_name, school_id)
  VALUES (
    NEW.id,
    COALESCE(full_name_value, split_part(NEW.email, '@', 1)),
    school_name_value,
    new_school_id
  );
  
  -- If user signed up via /signup route (is_super_admin flag), give them Principal role
  IF (NEW.raw_user_meta_data->>'is_super_admin')::boolean IS TRUE THEN
    INSERT INTO public.user_roles (user_id, role, school_id)
    VALUES (NEW.id, 'Principal', new_school_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Trigger function that automatically creates a school and assigns school_id to profile when a new user signs up';

