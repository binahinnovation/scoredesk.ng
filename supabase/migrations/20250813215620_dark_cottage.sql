/*
  # Fix infinite recursion in messages table policies

  1. Problem
    - The current RLS policies on the messages table are causing infinite recursion
    - This prevents messages from being sent or retrieved

  2. Solution
    - Drop all existing policies on messages table
    - Create new, simple policies that avoid recursion
    - Use direct auth.uid() comparisons instead of complex subqueries

  3. New Policies
    - Principals can manage all messages
    - Users can insert their own messages
    - Users can view messages they sent
    - Users can view messages sent to them (via message_recipients)
    - Users can update their own messages
    - Users can delete their own messages
*/

-- Drop all existing policies on messages table
DROP POLICY IF EXISTS "Principals can manage all messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can read messages sent to them" ON messages;
DROP POLICY IF EXISTS "Users can read messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create new, simple policies that avoid recursion

-- Policy for principals to manage all messages
CREATE POLICY "principals_manage_messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());

-- Policy for users to insert their own messages
CREATE POLICY "users_insert_own_messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Policy for users to view messages they sent
CREATE POLICY "users_view_sent_messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

-- Policy for users to view messages sent to them
CREATE POLICY "users_view_received_messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM message_recipients mr 
      WHERE mr.message_id = messages.id 
      AND mr.recipient_id = auth.uid()
    )
  );

-- Policy for users to update their own messages
CREATE POLICY "users_update_own_messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Policy for users to delete their own messages
CREATE POLICY "users_delete_own_messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());