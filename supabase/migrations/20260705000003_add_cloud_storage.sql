-- Create School Documents table to track uploaded files
CREATE TABLE IF NOT EXISTS public.school_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    content_type TEXT,
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.school_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users in same school" ON public.school_documents
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert access for users in same school" ON public.school_documents
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable delete access for users in same school" ON public.school_documents
    FOR DELETE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
