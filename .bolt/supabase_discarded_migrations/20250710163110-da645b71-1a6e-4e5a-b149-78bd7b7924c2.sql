-- Fix assessment issues without deleting referenced assessments

-- Update Mid-Term Test to be First CA instead of deleting
UPDATE public.assessments 
SET name = 'First CA', type = 'Continuous Assessment', weight = 0.2, max_score = 20 
WHERE name = 'Mid-Term Test';

-- Update other assessments to correct weights
UPDATE public.assessments 
SET weight = 0.2, max_score = 20 
WHERE name = 'Second CA' AND type = 'Continuous Assessment';

UPDATE public.assessments 
SET weight = 0.6, max_score = 60 
WHERE name = 'End of Term Exam' AND type = 'End of Term Exam';

-- Ensure there's at least one current term
UPDATE public.terms 
SET is_current = true 
WHERE id = (
  SELECT id FROM public.terms 
  WHERE is_current IS NOT TRUE 
  ORDER BY created_at DESC 
  LIMIT 1
) 
AND NOT EXISTS (SELECT 1 FROM public.terms WHERE is_current = true);

-- Add default assessment settings
INSERT INTO public.settings (setting_key, setting_value, school_id) 
VALUES 
('assessment_weights', '{"first_ca": 20, "second_ca": 20, "exam": 60}', null),
('grade_boundaries', '{"A": 80, "B": 70, "C": 60, "D": 50, "F": 0}', null)
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value;