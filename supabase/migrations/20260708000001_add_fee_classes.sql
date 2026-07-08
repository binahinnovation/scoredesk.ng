ALTER TABLE public.fees ADD COLUMN class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;
