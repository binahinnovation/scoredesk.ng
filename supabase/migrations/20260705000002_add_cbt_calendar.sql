-- CBT Exams table
CREATE TABLE IF NOT EXISTS public.cbt_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cbt_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.cbt_exams
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.cbt_exams
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable update for users in same school" ON public.cbt_exams
    FOR UPDATE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable delete for users in same school" ON public.cbt_exams
    FOR DELETE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- Allow anonymous/public read for student portal
CREATE POLICY "Enable public read for published exams" ON public.cbt_exams
    FOR SELECT USING (status = 'published');

-- CBT Questions table
CREATE TABLE IF NOT EXISTS public.cbt_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated" ON public.cbt_questions
    FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.cbt_questions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated" ON public.cbt_questions
    FOR DELETE USING (true);

-- CBT Attempts table
CREATE TABLE IF NOT EXISTS public.cbt_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    score NUMERIC,
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

ALTER TABLE public.cbt_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON public.cbt_attempts
    FOR ALL USING (true);

-- CBT Answers table
CREATE TABLE IF NOT EXISTS public.cbt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.cbt_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.cbt_questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cbt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON public.cbt_answers
    FOR ALL USING (true);

-- Academic Events table
CREATE TABLE IF NOT EXISTS public.academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'event',
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.academic_events
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.academic_events
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable update for users in same school" ON public.academic_events
    FOR UPDATE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable delete for users in same school" ON public.academic_events
    FOR DELETE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
