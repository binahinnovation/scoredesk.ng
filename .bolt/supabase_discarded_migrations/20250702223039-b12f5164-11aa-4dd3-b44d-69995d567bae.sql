-- Complete ScoreDesk Database Migration
-- This migration creates all tables, functions, policies, and triggers needed for the school management system

-- 1. Create enum types
CREATE TYPE public.app_role AS ENUM ('Principal', 'Exam Officer', 'Form Teacher', 'Subject Teacher');
CREATE TYPE public.assessment_type AS ENUM ('Continuous Assessment', 'Mid-Term Test', 'End of Term Exam');

-- 2. Create schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  alias text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  school_name text,
  school_id uuid REFERENCES public.schools(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  school_id uuid REFERENCES public.schools(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. Create classes table
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  school_id uuid REFERENCES public.schools(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create subjects table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  description text,
  school_id uuid REFERENCES public.schools(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Create class_subjects table (many-to-many relationship)
CREATE TABLE public.class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

-- 8. Create terms table
CREATE TABLE public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name IN ('First Term', 'Second Term', 'Third Term')),
  academic_year text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  school_id uuid REFERENCES public.schools(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Create students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  middle_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('Male', 'Female')),
  email text,
  phone text,
  address text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  class_id uuid REFERENCES public.classes(id),
  school_id uuid REFERENCES public.schools(id),
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Transferred')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, school_id)
);

-- 10. Create assessments table
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type assessment_type NOT NULL,
  max_score numeric NOT NULL DEFAULT 100,
  weight numeric NOT NULL DEFAULT 1.0,
  school_id uuid REFERENCES public.schools(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Create results table
CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id),
  term_id uuid NOT NULL REFERENCES public.terms(id),
  score numeric NOT NULL,
  max_score numeric NOT NULL DEFAULT 100,
  grade text,
  remarks text,
  teacher_id uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  status text DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
  school_id uuid REFERENCES public.schools(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, assessment_id, term_id)
);

-- 12. Create settings table
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  setting_value jsonb,
  school_id uuid REFERENCES public.schools(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(setting_key, school_id)
);

-- 13. Create term_archives table
CREATE TABLE public.term_archives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id uuid NOT NULL REFERENCES public.terms(id),
  academic_year text NOT NULL,
  results_count integer DEFAULT 0,
  students_count integer DEFAULT 0,
  archived_at timestamptz NOT NULL DEFAULT now(),
  school_id uuid REFERENCES public.schools(id)
);

-- 14. Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('school-logos', 'school-logos', true),
  ('documents', 'documents', false);

-- 15. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_archives ENABLE ROW LEVEL SECURITY;

-- 16. Create security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_is_super_admin BOOLEAN;
    v_email TEXT;
BEGIN
    -- Fetch user details in one go for efficiency
    SELECT
        email,
        (raw_user_meta_data->>'is_super_admin')::boolean
    INTO
        v_email,
        v_is_super_admin
    FROM auth.users
    WHERE id = user_id_param;

    -- Check for super admin conditions first
    IF v_is_super_admin IS TRUE OR v_email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com') THEN
        RETURN 'Principal';
    END IF;

    -- If not a super admin, fetch role from user_roles table
    SELECT role
    INTO v_role
    FROM public.user_roles
    WHERE user_id = user_id_param
    LIMIT 1;

    -- Return the found role or a default value
    RETURN COALESCE(v_role, 'Subject Teacher');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_principal()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      (raw_user_meta_data->>'is_super_admin')::boolean = true 
      OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
    )
  ) OR public.get_user_role(auth.uid()) = 'Principal';
$$;

-- 17. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Principals can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_current_user_principal());

CREATE POLICY "Principals can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_current_user_principal());

CREATE POLICY "Principals can update profiles" ON public.profiles
  FOR UPDATE USING (public.is_current_user_principal()) WITH CHECK (public.is_current_user_principal());

-- 18. Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        (raw_user_meta_data->>'is_super_admin')::boolean = true 
        OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
      )
    )
  );

CREATE POLICY "Super admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        (raw_user_meta_data->>'is_super_admin')::boolean = true 
        OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
      )
    )
  );

CREATE POLICY "Super admins can update roles" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        (raw_user_meta_data->>'is_super_admin')::boolean = true 
        OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
      )
    )
  );

CREATE POLICY "Super admins can delete roles" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (
        (raw_user_meta_data->>'is_super_admin')::boolean = true 
        OR email IN ('deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com', 'superadmin@scoredesk.com')
      )
    )
  );

-- 19. Create RLS policies for schools
CREATE POLICY "Principals can manage schools" ON public.schools
  FOR ALL USING (public.is_current_user_principal());

-- 20. Create RLS policies for other tables (simplified for now - can be refined later)
CREATE POLICY "Authenticated users can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage classes" ON public.classes
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage subjects" ON public.subjects
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view class_subjects" ON public.class_subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage class_subjects" ON public.class_subjects
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view terms" ON public.terms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage terms" ON public.terms
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view students" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage students" ON public.students
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view assessments" ON public.assessments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage assessments" ON public.assessments
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view results" ON public.results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage results" ON public.results
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Teachers can insert results" ON public.results
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own results" ON public.results
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Authenticated users can view settings" ON public.settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage settings" ON public.settings
  FOR ALL USING (public.is_current_user_principal());

CREATE POLICY "Authenticated users can view term_archives" ON public.term_archives
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Principals can manage term_archives" ON public.term_archives
  FOR ALL USING (public.is_current_user_principal());

-- 21. Create storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "School logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'school-logos');

CREATE POLICY "Principals can upload school logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'school-logos' AND public.is_current_user_principal());

CREATE POLICY "Principals can update school logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'school-logos' AND public.is_current_user_principal());

CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 22. Create triggers for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', new.email));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 23. Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 24. Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON public.terms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 25. Insert default assessments
INSERT INTO public.assessments (name, type, max_score, weight) VALUES
  ('First CA', 'Continuous Assessment', 10, 0.1),
  ('Second CA', 'Continuous Assessment', 10, 0.1),
  ('Mid-Term Test', 'Mid-Term Test', 20, 0.2),
  ('End of Term Exam', 'End of Term Exam', 60, 0.6);

-- 26. Insert default current term setting
INSERT INTO public.settings (setting_key, setting_value) VALUES
  ('current_term', '{"term_id": null, "term_name": "First Term", "academic_year": "2024/2025"}'::jsonb);