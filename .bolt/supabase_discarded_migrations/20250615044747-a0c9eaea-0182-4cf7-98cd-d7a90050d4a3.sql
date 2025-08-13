
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_is_super_admin BOOLEAN;
    v_email TEXT;
BEGIN
    -- Fetch user details in one go for efficiency
    SELECT
        email,
        (raw_user_meta_data->>'is_super_admin')::boolean
    INTO
        v_email,
        v_is_super_admin
    FROM auth.users
    WHERE id = user_id_param;

    -- Check for super admin conditions first. This list is now consistent
    -- with the security policies.
    IF v_is_super_admin IS TRUE OR v_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
        RETURN 'Principal';
    END IF;

    -- If not a super admin, fetch role from user_roles table
    SELECT role
    INTO v_role
    FROM public.user_roles
    WHERE user_id = user_id_param
    LIMIT 1;

    -- Return the found role or a default value ('Subject Teacher') if no role is assigned.
    RETURN COALESCE(v_role, 'Subject Teacher');
END;
$$;
