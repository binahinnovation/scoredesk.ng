/*
  # Add usage count tracking to scratch cards

  1. Updates
    - Add usage_count column to track how many times a card has been used
    - Add max_usage_count column to set the limit (default 3)
    - Update mark_scratch_card_used function to handle usage count
    - Add index for better performance on usage queries

  2. Function Changes
    - Update mark_scratch_card_used to increment usage_count
    - Set status to 'Expired' when usage_count reaches max_usage_count
    - Return usage information in the function
*/

-- Add usage count columns to scratch_cards table
ALTER TABLE public.scratch_cards 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_usage_count INTEGER DEFAULT 3;

-- Create index for usage count queries
CREATE INDEX IF NOT EXISTS idx_scratch_cards_usage_count ON public.scratch_cards(usage_count);
CREATE INDEX IF NOT EXISTS idx_scratch_cards_used_by ON public.scratch_cards(used_by);

-- Update the mark_scratch_card_used function to handle usage count
CREATE OR REPLACE FUNCTION public.mark_scratch_card_used(
  card_pin TEXT,
  p_user_id UUID DEFAULT NULL,
  p_student_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  card_record RECORD;
  result JSON;
BEGIN
  -- Validate input
  IF card_pin IS NULL OR trim(card_pin) = '' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid card PIN',
      'usage_count', 0,
      'max_usage', 3
    );
  END IF;

  -- Get current card information
  SELECT * INTO card_record
  FROM scratch_cards 
  WHERE pin = trim(card_pin);

  -- Check if card exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Card not found',
      'usage_count', 0,
      'max_usage', 3
    );
  END IF;

  -- Check if card is already expired
  IF card_record.status = 'Expired' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Card has expired',
      'usage_count', card_record.usage_count,
      'max_usage', card_record.max_usage_count
    );
  END IF;

  -- Check if usage limit reached
  IF card_record.usage_count >= card_record.max_usage_count THEN
    -- Mark as expired
    UPDATE scratch_cards 
    SET 
      status = 'Expired',
      updated_at = now()
    WHERE pin = trim(card_pin);
    
    RETURN json_build_object(
      'success', false,
      'message', 'Card usage limit reached',
      'usage_count', card_record.usage_count,
      'max_usage', card_record.max_usage_count
    );
  END IF;

  -- Update the scratch card with usage information
  UPDATE scratch_cards 
  SET 
    usage_count = usage_count + 1,
    status = CASE 
      WHEN usage_count + 1 >= max_usage_count THEN 'Expired'
      ELSE 'Active'
    END,
    used_at = now(),
    used_by = p_student_id,
    used_for_result_check = TRUE,
    updated_at = now()
  WHERE 
    pin = trim(card_pin) 
    AND status = 'Active';

  -- Get updated card information
  SELECT * INTO card_record
  FROM scratch_cards 
  WHERE pin = trim(card_pin);

  -- Return success with usage information
  RETURN json_build_object(
    'success', true,
    'message', 'Card used successfully',
    'usage_count', card_record.usage_count,
    'max_usage', card_record.max_usage_count,
    'remaining_uses', GREATEST(0, card_record.max_usage_count - card_record.usage_count),
    'is_expired', card_record.status = 'Expired'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE LOG 'Error in mark_scratch_card_used: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'message', 'Database error occurred',
      'usage_count', 0,
      'max_usage', 3
    );
END;
$$;
