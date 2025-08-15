/*
  # Fix scratch card function and student lookup

  1. Updates
    - Fix mark_scratch_card_used function to properly update status and return boolean
    - Improve function to handle user_id parameter for tracking who used the card
    - Add proper error handling and validation

  2. Function Changes
    - Update status to 'Used' when card is marked as used
    - Set used_at timestamp
    - Set used_for_result_check to true
    - Accept optional user_id parameter
    - Return proper boolean values
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.mark_scratch_card_used(text);

-- Create improved function with proper status updates
CREATE OR REPLACE FUNCTION public.mark_scratch_card_used(
  card_pin TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  card_found BOOLEAN := FALSE;
BEGIN
  -- Validate input
  IF card_pin IS NULL OR trim(card_pin) = '' THEN
    RETURN FALSE;
  END IF;

  -- Update the scratch card
  UPDATE scratch_cards 
  SET 
    status = 'Used',
    used_at = now(),
    used_by = p_user_id,
    used_for_result_check = TRUE,
    updated_at = now()
  WHERE 
    pin = trim(card_pin) 
    AND status = 'Active' 
    AND (used_for_result_check = FALSE OR used_for_result_check IS NULL);

  -- Check if any row was updated
  GET DIAGNOSTICS card_found = ROW_COUNT;
  
  -- Return true if a card was successfully updated
  RETURN card_found > 0;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE LOG 'Error in mark_scratch_card_used: %', SQLERRM;
    RETURN FALSE;
END;
$$;