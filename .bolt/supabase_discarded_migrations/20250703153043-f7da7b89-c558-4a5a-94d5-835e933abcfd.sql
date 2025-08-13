-- Create scratch_cards table with all required columns
CREATE TABLE IF NOT EXISTS public.scratch_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 100,
  price NUMERIC NOT NULL DEFAULT 100,
  revenue_generated NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Used', 'Expired')),
  term_id UUID REFERENCES public.terms(id),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scratch_cards
ALTER TABLE public.scratch_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scratch_cards
CREATE POLICY "Authenticated users can view scratch cards" 
ON public.scratch_cards 
FOR SELECT 
USING (true);

CREATE POLICY "Principals can manage scratch cards" 
ON public.scratch_cards 
FOR ALL 
USING (is_current_user_principal());

-- Add indexes for performance
CREATE INDEX idx_scratch_cards_serial_number ON public.scratch_cards(serial_number);
CREATE INDEX idx_scratch_cards_pin ON public.scratch_cards(pin);
CREATE INDEX idx_scratch_cards_status ON public.scratch_cards(status);
CREATE INDEX idx_scratch_cards_term_id ON public.scratch_cards(term_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scratch_cards_updated_at
  BEFORE UPDATE ON public.scratch_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_approved column to results table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'results' 
    AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE public.results ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;