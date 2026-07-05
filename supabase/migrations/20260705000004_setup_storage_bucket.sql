-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('school_documents', 'school_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled by default on storage.objects in Supabase.
-- We do not need to (and cannot) run ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to the bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'school_documents');

-- Policy to allow authenticated users to read/download files from the bucket
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'school_documents');

-- Policy to allow authenticated users to delete files from the bucket
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'school_documents');
