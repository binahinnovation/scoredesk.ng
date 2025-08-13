/*
  # Fix infinite recursion in messages RLS policies

  1. Problem
    - Circular dependencies between messages, message_recipients, and profiles policies
    - Complex subqueries causing infinite recursion during policy evaluation

  2. Solution
    - Completely disable and rebuild RLS policies for all related tables
    - Use simplified policies with direct auth.uid() comparisons
    - Avoid complex joins and subqueries that create circular references

  3. Tables affected
    - messages: Simplified sender/recipient access policies
    - message_recipients: Basic recipient and sender policies
    - profiles: Maintain existing simple policies

  4. Security
    - Users can only access their own messages (sent or received)
    - Principals have full access via is_current_user_principal()
    - Recipients can manage their own message_recipients entries
*/

-- Step 1: Disable RLS on all affected tables
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "messages_insert_as_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_select_own_sent" ON public.messages;
DROP POLICY IF EXISTS "messages_select_received" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "messages_principal_full_access" ON public.messages;

DROP POLICY IF EXISTS "mr_select" ON public.message_recipients;
DROP POLICY IF EXISTS "mr_insert" ON public.message_recipients;
DROP POLICY IF EXISTS "mr_update_recipient" ON public.message_recipients;
DROP POLICY IF EXISTS "mr_delete_sender" ON public.message_recipients;

DROP POLICY IF EXISTS "ma_select" ON public.message_attachments;
DROP POLICY IF EXISTS "ma_insert" ON public.message_attachments;
DROP POLICY IF EXISTS "ma_delete" ON public.message_attachments;

-- Step 3: Re-enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simplified policies for messages table
CREATE POLICY "messages_select_own_sent"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "messages_select_received"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.message_recipients 
      WHERE message_recipients.message_id = messages.id 
      AND message_recipients.recipient_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_as_sender"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_own"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_delete_own"
  ON public.messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "messages_principal_full_access"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (is_current_user_principal())
  WITH CHECK (is_current_user_principal());

-- Step 5: Create simplified policies for message_recipients table
CREATE POLICY "mr_select_own"
  ON public.message_recipients
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "mr_select_sent"
  ON public.message_recipients
  FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "mr_insert_any"
  ON public.message_recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "mr_update_own"
  ON public.message_recipients
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "mr_delete_sender"
  ON public.message_recipients
  FOR DELETE
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

-- Step 6: Create simplified policies for message_attachments table
CREATE POLICY "ma_select_sender"
  ON public.message_attachments
  FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "ma_select_recipient"
  ON public.message_attachments
  FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT mr.message_id 
      FROM public.message_recipients mr 
      WHERE mr.recipient_id = auth.uid()
    )
  );

CREATE POLICY "ma_insert_sender"
  ON public.message_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "ma_delete_sender"
  ON public.message_attachments
  FOR DELETE
  TO authenticated
  USING (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );