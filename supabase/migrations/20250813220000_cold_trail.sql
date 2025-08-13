/*
  # Rebuild messages table RLS policies from scratch

  This migration completely rebuilds the RLS policies for the messages table to eliminate
  infinite recursion issues.

  1. Security Changes
    - Temporarily disable RLS on messages table
    - Drop all existing policies that may be causing recursion
    - Re-enable RLS with minimal, non-recursive policies
    - Ensure users can only access their own sent/received messages
    - Maintain principal access for administration

  2. Policy Strategy
    - Use direct auth.uid() comparisons only
    - Avoid any subqueries that could create circular references
    - Keep policies as simple as possible
*/

-- Temporarily disable RLS to clear all policies
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
DROP POLICY IF EXISTS "messages_select_sent_policy" ON messages;
DROP POLICY IF EXISTS "messages_select_received_policy" ON messages;
DROP POLICY IF EXISTS "messages_update_policy" ON messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON messages;
DROP POLICY IF EXISTS "messages_principal_policy" ON messages;

-- Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create new, simple policies that avoid recursion

-- Policy for inserting messages (users can only create messages as themselves)
CREATE POLICY "messages_insert_simple" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Policy for selecting sent messages (users can view messages they sent)
CREATE POLICY "messages_select_sent_simple" ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

-- Policy for selecting received messages (users can view messages sent to them)
-- This uses a simple EXISTS without referencing profiles table
CREATE POLICY "messages_select_received_simple" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM message_recipients mr 
      WHERE mr.message_id = messages.id 
      AND mr.recipient_id = auth.uid()
    )
  );

-- Policy for updating messages (users can only update their own sent messages)
CREATE POLICY "messages_update_simple" ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Policy for deleting messages (users can only delete their own sent messages)
CREATE POLICY "messages_delete_simple" ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

-- Principal override policy (principals can manage all messages)
CREATE POLICY "messages_principal_override" ON messages
  FOR ALL
  TO authenticated
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());