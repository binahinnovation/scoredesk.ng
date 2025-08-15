/*
  # Fix infinite recursion in messages RLS policies

  1. Problem
    - Current RLS policies on messages table have circular dependencies
    - Policies reference the same table they're protecting, causing infinite recursion
    - This prevents message sending functionality from working

  2. Solution
    - Drop existing problematic policies
    - Create simplified, non-recursive policies
    - Ensure policies don't reference the messages table within their conditions

  3. New Policies
    - Users can insert messages as sender (simple check)
    - Users can view their own sent messages (simple check)
    - Users can view messages they received (via message_recipients)
    - Users can update/delete their own messages (simple check)
    - Principals have full access to all messages in their school
*/

-- Drop all existing policies on messages table to start fresh
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_as_sender" ON public.messages;
DROP POLICY IF EXISTS "messages_principal_full_access" ON public.messages;
DROP POLICY IF EXISTS "messages_select_own_sent" ON public.messages;
DROP POLICY IF EXISTS "messages_select_received" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;

-- Create new simplified policies without circular references

-- Policy 1: Users can insert messages as sender
CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Users can view their own sent messages
CREATE POLICY "messages_select_sent_policy"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id);

-- Policy 3: Users can view messages they received (via message_recipients table)
CREATE POLICY "messages_select_received_policy"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_recipients mr
    WHERE mr.message_id = id AND mr.recipient_id = auth.uid()
  )
);

-- Policy 4: Users can update their own messages (only if they're drafts)
CREATE POLICY "messages_update_own_policy"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id AND is_draft = true)
WITH CHECK (auth.uid() = sender_id);

-- Policy 5: Users can delete their own messages
CREATE POLICY "messages_delete_own_policy"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- Policy 6: Principals have full access to all messages in their school
CREATE POLICY "messages_principal_full_access_policy"
ON public.messages FOR ALL
USING (
  is_current_user_principal() 
  AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  is_current_user_principal()
  AND school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
);