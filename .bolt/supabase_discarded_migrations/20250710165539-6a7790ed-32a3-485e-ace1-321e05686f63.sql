-- Phase 1: Critical Fixes (Updated)

-- 1.1 Fix Student Result Portal - Update RLS policies on terms table to allow public read access
DROP POLICY IF EXISTS "Authenticated users can view terms" ON public.terms;
CREATE POLICY "Public can view terms" 
ON public.terms 
FOR SELECT 
USING (true);

-- 1.2 Handle duplicate First CA assessment safely
-- First, get the IDs of both First CA assessments
DO $$
DECLARE
    old_assessment_id uuid;
    new_assessment_id uuid;
BEGIN
    -- Get the old assessment (weight 0.1, max_score 10)
    SELECT id INTO old_assessment_id 
    FROM public.assessments 
    WHERE name = 'First CA' AND weight = 0.1 AND max_score = 10;
    
    -- Get the new assessment (weight 0.2, max_score 20)
    SELECT id INTO new_assessment_id 
    FROM public.assessments 
    WHERE name = 'First CA' AND weight = 0.2 AND max_score = 20;
    
    -- Update any results referencing the old assessment to use the new one
    IF old_assessment_id IS NOT NULL AND new_assessment_id IS NOT NULL THEN
        UPDATE public.results 
        SET assessment_id = new_assessment_id,
            max_score = 20
        WHERE assessment_id = old_assessment_id;
        
        -- Now delete the old assessment
        DELETE FROM public.assessments WHERE id = old_assessment_id;
    END IF;
END $$;

-- Verify we have the correct assessments
SELECT name, weight, max_score FROM public.assessments ORDER BY name;