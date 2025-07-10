-- Phase 1: Critical Fixes (Safe approach)

-- 1.1 Fix Student Result Portal - Update RLS policies on terms table to allow public read access
DROP POLICY IF EXISTS "Authenticated users can view terms" ON public.terms;
CREATE POLICY "Public can view terms" 
ON public.terms 
FOR SELECT 
USING (true);

-- 1.2 Handle duplicate First CA assessment safely by removing conflicts first
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
    
    IF old_assessment_id IS NOT NULL AND new_assessment_id IS NOT NULL THEN
        -- Delete results for old assessment where there's already a result for new assessment
        DELETE FROM public.results r1
        WHERE r1.assessment_id = old_assessment_id
        AND EXISTS (
            SELECT 1 FROM public.results r2 
            WHERE r2.student_id = r1.student_id 
            AND r2.subject_id = r1.subject_id 
            AND r2.term_id = r1.term_id 
            AND r2.assessment_id = new_assessment_id
        );
        
        -- Update remaining results for old assessment to new assessment
        UPDATE public.results 
        SET assessment_id = new_assessment_id,
            max_score = 20
        WHERE assessment_id = old_assessment_id;
        
        -- Now delete the old assessment
        DELETE FROM public.assessments WHERE id = old_assessment_id;
    END IF;
END $$;