-- Fix scratch card revenue calculation when cards are used
-- This migration updates the mark_scratch_card_used function to properly calculate and update revenue

-- Update the mark_scratch_card_used function to handle revenue generation
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

  -- Update the scratch card with usage information and revenue calculation
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
    -- Calculate revenue: price of the card when it's used
    revenue_generated = CASE 
      WHEN usage_count = 0 THEN price  -- First use: full price
      ELSE price / max_usage_count     -- Subsequent uses: price divided by max usage
    END,
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
    'is_expired', card_record.status = 'Expired',
    'revenue_generated', card_record.revenue_generated
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
