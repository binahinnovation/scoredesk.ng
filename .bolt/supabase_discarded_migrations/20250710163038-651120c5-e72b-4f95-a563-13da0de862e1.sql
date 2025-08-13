-- Fix assessment issues and term detection

-- Delete the Mid-Term Test assessment that shouldn't exist
DELETE FROM public.assessments WHERE name = 'Mid-Term Test';

-- Update assessment weights to match requirements
-- First CA: 20% (weight: 0.2, max_score: 20)
UPDATE public.assessments 
SET weight = 0.2, max_score = 20 
WHERE name = 'First CA' AND type = 'Continuous Assessment';

-- Second CA: 20% (weight: 0.2, max_score: 20)  
UPDATE public.assessments 
SET weight = 0.2, max_score = 20 
WHERE name = 'Second CA' AND type = 'Continuous Assessment';

-- End of Term Exam: 60% (weight: 0.6, max_score: 60)
UPDATE public.assessments 
SET weight = 0.6, max_score = 60 
WHERE name = 'End of Term Exam' AND type = 'End of Term Exam';

-- Ensure there's at least one current term for testing
-- Update the most recent term to be current if no current term exists
UPDATE public.terms 
SET is_current = true 
WHERE id = (
  SELECT id FROM public.terms 
  WHERE is_current IS NOT TRUE 
  ORDER BY created_at DESC 
  LIMIT 1
) 
AND NOT EXISTS (SELECT 1 FROM public.terms WHERE is_current = true);

-- Add default assessment settings to settings table
INSERT INTO public.settings (setting_key, setting_value, school_id) 
VALUES 
('assessment_weights', '{"first_ca": 20, "second_ca": 20, "exam": 60}', null),
('grade_boundaries', '{"A": 80, "B": 70, "C": 60, "D": 50, "F": 0}', null)
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value;