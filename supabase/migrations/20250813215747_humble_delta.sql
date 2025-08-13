/*
  # Fix infinite recursion in messages table policies

  1. Security Changes
    - Drop all existing policies on messages table
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparisons only
    - Avoid any subqueries that could cause recursion

  2. Policy Structure
    - Simple INSERT policy for authenticated users
    - Basic SELECT policies without complex joins
    - Direct UPDATE/DELETE policies for message owners
    - Principal override policy using existing function
*/

-- Drop all existing policies on messages table
DROP POLICY IF EXISTS "principals_manage_messages" ON messages;
DROP POLICY IF EXISTS "users_delete_own_messages" ON messages;
DROP POLICY IF EXISTS "users_insert_own_messages" ON messages;
DROP POLICY IF EXISTS "users_update_own_messages" ON messages;
DROP POLICY IF EXISTS "users_view_received_messages" ON messages;
DROP POLICY IF EXISTS "users_view_sent_messages" ON messages;

-- Create simple, non-recursive policies
CREATE POLICY "messages_insert_policy" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_select_sent_policy" ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "messages_select_received_policy" ON messages
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT message_id 
      FROM message_recipients 
      WHERE recipient_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_policy" ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_delete_policy" ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "messages_principal_policy" ON messages
  FOR ALL
  TO authenticated
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());