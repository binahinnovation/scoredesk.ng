
-- First, let's check and create RLS policies for the profiles table
-- Allow users to insert their own profile (needed for manual fallback)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Users can select their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow principals to select all profiles in their school
CREATE POLICY "Principals can select all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_current_user_principal());

-- Allow principals to insert profiles (for creating users)
CREATE POLICY "Principals can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (public.is_current_user_principal());

-- Allow principals to update profiles
CREATE POLICY "Principals can update profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_current_user_principal()) 
WITH CHECK (public.is_current_user_principal());
