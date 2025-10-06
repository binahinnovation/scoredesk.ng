/*
  # Fix Existing Users Without School ID

  This migration fixes users who signed up before the auto-create-school trigger was in place.
  It creates schools for them and assigns school_id to their profiles.
*/

-- Create schools for existing users without school_id
DO $$
DECLARE
  user_record RECORD;
  new_school_id uuid;
  school_name_value text;
  alias_value text;
BEGIN
  -- Loop through all profiles without school_id
  FOR user_record IN 
    SELECT p.id, p.full_name, p.school_name, u.email, u.raw_user_meta_data
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p.school_id IS NULL
  LOOP
    -- Determine school name
    school_name_value := COALESCE(
      user_record.school_name,
      user_record.raw_user_meta_data->>'school_name',
      split_part(user_record.email, '@', 1) || ' School'
    );
    
    -- Create alias
    alias_value := lower(regexp_replace(school_name_value, '[^a-zA-Z0-9]', '', 'g'));
    alias_value := substring(alias_value, 1, 32);
    
    -- Create school
    INSERT INTO public.schools (name, alias, created_by)
    VALUES (school_name_value, alias_value, user_record.id)
    RETURNING id INTO new_school_id;
    
    -- Update profile with school_id
    UPDATE public.profiles
    SET school_id = new_school_id,
        school_name = school_name_value
    WHERE id = user_record.id;
    
    -- If user has is_super_admin flag or is one of the hardcoded admins, create Principal role
    IF (user_record.raw_user_meta_data->>'is_super_admin')::boolean IS TRUE 
       OR user_record.email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
      -- Check if role already exists
      IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = user_record.id) THEN
        INSERT INTO public.user_roles (user_id, role, school_id)
        VALUES (user_record.id, 'Principal', new_school_id);
      ELSE
        -- Update existing role with school_id
        UPDATE public.user_roles
        SET school_id = new_school_id
        WHERE user_id = user_record.id AND school_id IS NULL;
      END IF;
    END IF;
    
    RAISE NOTICE 'Created school % (%) for user %', school_name_value, new_school_id, user_record.email;
  END LOOP;
END $$;

-- Verify: Show users with school_id
DO $$
DECLARE
  total_users integer;
  users_with_school integer;
  users_without_school integer;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO users_with_school FROM public.profiles WHERE school_id IS NOT NULL;
  SELECT COUNT(*) INTO users_without_school FROM public.profiles WHERE school_id IS NULL;
  
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with school_id: %', users_with_school;
  RAISE NOTICE 'Users without school_id: %', users_without_school;
END $$;

