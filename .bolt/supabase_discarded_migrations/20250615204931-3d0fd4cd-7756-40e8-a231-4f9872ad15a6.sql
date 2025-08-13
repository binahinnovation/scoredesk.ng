
-- First, drop the existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view own role or principals view all" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only principals can delete roles" ON public.user_roles;

-- Create new, safer policies that avoid recursion
-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

-- Allow super admins (principals) to view all roles - using direct auth check to avoid recursion
CREATE POLICY "Super admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to insert roles - using direct auth check to avoid recursion
CREATE POLICY "Super admins can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to update roles
CREATE POLICY "Super admins can update roles" 
ON public.user_roles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);

-- Allow super admins to delete roles
CREATE POLICY "Super admins can delete roles" 
ON public.user_roles FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  )
);
