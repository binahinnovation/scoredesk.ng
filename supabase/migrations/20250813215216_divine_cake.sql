/*
  # Fix user_roles RLS policies

  1. Security Changes
    - Drop existing RLS policies on user_roles table that directly access users table
    - Create new simplified policies that use the existing is_current_user_principal() function
    - Allow principals to manage all user roles
    - Allow users to view their own roles only

  2. Changes Made
    - Removed complex policies that query users table directly
    - Simplified to use existing helper functions
    - Maintained security while fixing permission issues
*/

-- Drop existing policies that cause permission issues
DROP POLICY IF EXISTS "Super admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create new simplified policies using existing functions
CREATE POLICY "Principals can manage all user roles"
  ON user_roles
  FOR ALL
  TO public
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());

CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO public
  USING (user_id = auth.uid());