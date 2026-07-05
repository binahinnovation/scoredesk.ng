-- Fees table
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    term TEXT,
    session TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.fees
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.fees
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable update for users in same school" ON public.fees
    FOR UPDATE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable delete for users in same school" ON public.fees
    FOR DELETE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- Fee Payments table
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.fee_payments
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.fee_payments
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- Staff table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in same school" ON public.staff
    FOR SELECT USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable insert for users in same school" ON public.staff
    FOR INSERT WITH CHECK (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable update for users in same school" ON public.staff
    FOR UPDATE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
CREATE POLICY "Enable delete for users in same school" ON public.staff
    FOR DELETE USING (school_id = (SELECT school_id FROM public.profiles WHERE profiles.id = auth.uid()));
