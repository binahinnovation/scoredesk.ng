-- Phase 1: Critical Fixes

-- 1.1 Fix Student Result Portal - Update RLS policies on terms table to allow public read access
DROP POLICY IF EXISTS "Authenticated users can view terms" ON public.terms;
CREATE POLICY "Public can view terms" 
ON public.terms 
FOR SELECT 
USING (true);

-- 1.2 Remove duplicate First CA assessment (keep the one with weight 0.2)
DELETE FROM public.assessments 
WHERE name = 'First CA' AND weight = 0.1 AND max_score = 10;

-- Verify we have the correct assessments
SELECT name, weight, max_score FROM public.assessments ORDER BY name;