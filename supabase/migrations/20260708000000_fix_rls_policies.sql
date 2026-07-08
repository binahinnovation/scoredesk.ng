-- Fix overly permissive RLS policies on CBT tables
-- cbt_questions: scope to exam's school
-- cbt_attempts: scope to exam's school
-- cbt_answers: scope to attempt's exam's school

-- ============================================================
-- FIX: cbt_questions — restrict to same school via exam_id
-- ============================================================
DROP POLICY IF EXISTS "Enable read for authenticated" ON public.cbt_questions;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON public.cbt_questions;
DROP POLICY IF EXISTS "Enable delete for authenticated" ON public.cbt_questions;

-- Teachers/admins in the same school can manage questions
CREATE POLICY "Enable read for users in same school" ON public.cbt_questions
    FOR SELECT USING (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

CREATE POLICY "Enable insert for users in same school" ON public.cbt_questions
    FOR INSERT WITH CHECK (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

CREATE POLICY "Enable update for users in same school" ON public.cbt_questions
    FOR UPDATE USING (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

CREATE POLICY "Enable delete for users in same school" ON public.cbt_questions
    FOR DELETE USING (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

-- Allow public read for questions of published exams (for student portal)
CREATE POLICY "Enable public read for published exam questions" ON public.cbt_questions
    FOR SELECT USING (
        exam_id IN (SELECT id FROM public.cbt_exams WHERE status = 'published')
    );

-- ============================================================
-- FIX: cbt_attempts — restrict to same school via exam_id
-- ============================================================
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.cbt_attempts;

CREATE POLICY "Enable read for users in same school" ON public.cbt_attempts
    FOR SELECT USING (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

CREATE POLICY "Enable insert for users in same school" ON public.cbt_attempts
    FOR INSERT WITH CHECK (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

-- Allow public insert for student portal (unauthenticated students taking exams)
CREATE POLICY "Enable public insert for published exam attempts" ON public.cbt_attempts
    FOR INSERT WITH CHECK (
        exam_id IN (SELECT id FROM public.cbt_exams WHERE status = 'published')
    );

CREATE POLICY "Enable update for users in same school" ON public.cbt_attempts
    FOR UPDATE USING (
        exam_id IN (
            SELECT id FROM public.cbt_exams
            WHERE school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

-- ============================================================
-- FIX: cbt_answers — restrict to same school via attempt's exam
-- ============================================================
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.cbt_answers;

CREATE POLICY "Enable read for users in same school" ON public.cbt_answers
    FOR SELECT USING (
        attempt_id IN (
            SELECT a.id FROM public.cbt_attempts a
            JOIN public.cbt_exams e ON a.exam_id = e.id
            WHERE e.school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

CREATE POLICY "Enable insert for users in same school" ON public.cbt_answers
    FOR INSERT WITH CHECK (
        attempt_id IN (
            SELECT a.id FROM public.cbt_attempts a
            JOIN public.cbt_exams e ON a.exam_id = e.id
            WHERE e.school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid())
        )
    );

-- ============================================================
-- FIX: storage.objects — restrict to user's school folder
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Only allow uploads to user's own school folder
CREATE POLICY "Allow school-scoped uploads" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'school_documents'
        AND (storage.foldername(name))[1] = (SELECT school_id::text FROM public.profiles WHERE id = auth.uid())
    );

-- Only allow reading files from user's own school folder
CREATE POLICY "Allow school-scoped reads" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'school_documents'
        AND (storage.foldername(name))[1] = (SELECT school_id::text FROM public.profiles WHERE id = auth.uid())
    );

-- Only allow deleting files from user's own school folder
CREATE POLICY "Allow school-scoped deletes" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'school_documents'
        AND (storage.foldername(name))[1] = (SELECT school_id::text FROM public.profiles WHERE id = auth.uid())
    );
