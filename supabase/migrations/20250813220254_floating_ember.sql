/*
  # Fix infinite recursion in messages table policies

  1. Problem
    - Current policies reference the messages table within messages table policies
    - This creates infinite recursion when Supabase tries to evaluate the policies

  2. Solution
    - Remove all policies that reference the messages table itself
    - Create simple policies that only use auth.uid() and direct foreign key relationships
    - Use EXISTS clauses only on other tables, never on the same table

  3. Security
    - Users can only insert messages as themselves (sender_id = auth.uid())
    - Users can only read messages they sent (sender_id = auth.uid())
    - Users can only read messages sent to them (via message_recipients table)
    - Users can only update/delete their own messages
    - Principals have full access via separate policy
*/

-- Step 1: Disable RLS temporarily to clear all policies
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "messages_insert_simple" ON messages;
DROP POLICY IF EXISTS "messages_select_sent_simple" ON messages;
DROP POLICY IF EXISTS "messages_select_received_simple" ON messages;
DROP POLICY IF EXISTS "messages_update_simple" ON messages;
DROP POLICY IF EXISTS "messages_delete_simple" ON messages;
DROP POLICY IF EXISTS "messages_principal_override" ON messages;

-- Step 3: Re-enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, non-recursive policies

-- Policy 1: Users can insert messages as themselves
CREATE POLICY "messages_insert_as_sender"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Users can read messages they sent
CREATE POLICY "messages_select_own_sent"
ON messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

-- Policy 3: Users can read messages sent to them (check recipients table only)
CREATE POLICY "messages_select_received"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM message_recipients
    WHERE message_recipients.message_id = messages.id
    AND message_recipients.recipient_id = auth.uid()
  )
);

-- Policy 4: Users can update their own messages
CREATE POLICY "messages_update_own"
ON messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Policy 5: Users can delete their own messages
CREATE POLICY "messages_delete_own"
ON messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Policy 6: Principals have full access (using existing function)
CREATE POLICY "messages_principal_full_access"
ON messages
FOR ALL
TO authenticated
USING (is_current_user_principal())
WITH CHECK (is_current_user_principal());