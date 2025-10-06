-- Create storage bucket for school logos
-- This migration ensures the school-logos bucket exists for profile logo uploads

-- Insert the school-logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-logos', 
  'school-logos', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create RLS policies for the school-logos bucket
CREATE POLICY "Users can upload their own school logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own school logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own school logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view school logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-logos');
