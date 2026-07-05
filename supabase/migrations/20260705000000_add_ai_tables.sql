-- AI Generated Lessons table
CREATE TABLE IF NOT EXISTS public.ai_generated_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    class_level TEXT,
    content TEXT,
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_generated_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.ai_generated_lessons
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.ai_generated_lessons
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- AI Generated Timetables table
CREATE TABLE IF NOT EXISTS public.ai_generated_timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_generated_timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.ai_generated_timetables
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.ai_generated_timetables
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
