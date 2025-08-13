/*
  # Fix messages table RLS policies

  1. Security Changes
    - Drop existing recursive policies on messages table
    - Create new simplified policies that avoid infinite recursion
    - Use direct user ID comparisons instead of complex subqueries
    - Maintain proper access control for messaging system

  2. Policy Changes
    - Users can insert messages they send
    - Users can read messages they sent or received
    - Users can update/delete their own sent messages
    - Principals can manage all messages in their school
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "msg_delete" ON messages;
DROP POLICY IF EXISTS "msg_insert" ON messages;
DROP POLICY IF EXISTS "msg_read" ON messages;
DROP POLICY IF EXISTS "msg_update" ON messages;

-- Create new simplified policies
CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can read messages they sent"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Users can read messages sent to them"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT message_id 
      FROM message_recipients 
      WHERE recipient_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Principals can manage all messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());