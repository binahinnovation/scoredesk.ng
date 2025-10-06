/*
  # Auto-create Default Assessments for Schools

  This migration ensures that all schools have default assessments:
  1. First CA (0.2 weight, 20 max score)
  2. Second CA (0.2 weight, 20 max score) 
  3. Exam (0.6 weight, 60 max score)
  
  Total: 100% weight for accurate calculations

  ## Changes
  1. Create default assessments for existing schools without assessments
  2. Set up proper assessment structure for new schools
*/

-- Function to create default assessments for a school
CREATE OR REPLACE FUNCTION public.create_default_assessments_for_school(p_school_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create First CA (20% weight, 20 max score)
  INSERT INTO public.assessments (school_id, name, type, weight, max_score)
  VALUES (
    p_school_id,
    'First CA',
    'Continuous Assessment',
    0.2,
    20
  );
  
  -- Create Second CA (20% weight, 20 max score)
  INSERT INTO public.assessments (school_id, name, type, weight, max_score)
  VALUES (
    p_school_id,
    'Second CA',
    'Continuous Assessment',
    0.2,
    20
  );
  
  -- Create Exam (60% weight, 60 max score)
  INSERT INTO public.assessments (school_id, name, type, weight, max_score)
  VALUES (
    p_school_id,
    'Exam',
    'End of Term Exam',
    0.6,
    60
  );
  
END;
$$;

-- Fix existing schools that don't have assessments yet
DO $$
DECLARE
  school_record RECORD;
BEGIN
  -- Loop through all schools without assessments
  FOR school_record IN 
    SELECT s.id, s.name
    FROM public.schools s
    LEFT JOIN public.assessments a ON a.school_id = s.id
    WHERE a.id IS NULL
  LOOP
    -- Create default assessments for this school
    PERFORM public.create_default_assessments_for_school(school_record.id);
    
    RAISE NOTICE 'Created default assessments for school: %', school_record.name;
  END LOOP;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_default_assessments_for_school(uuid) TO authenticated;

COMMENT ON FUNCTION public.create_default_assessments_for_school(uuid) IS 
'Creates default assessments (First CA: 20%, Second CA: 20%, Exam: 60%) for a school';
