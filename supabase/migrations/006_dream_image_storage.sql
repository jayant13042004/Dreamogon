-- Stage A: Dream image storage — path/metadata in Postgres, bytes in Storage
-- Keeps existing image_url for display (proxy path or legacy data URLs)

ALTER TABLE public.dreams
ADD COLUMN IF NOT EXISTS image_path text;

CREATE INDEX IF NOT EXISTS idx_dreams_image_path
  ON public.dreams(image_path)
  WHERE image_path IS NOT NULL;

-- Private bucket: objects served via authenticated app proxy / signed URLs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dream-images',
  'dream-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: {user_id}/{dream_id}/{filename}
DROP POLICY IF EXISTS "Users can upload own dream images" ON storage.objects;
CREATE POLICY "Users can upload own dream images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own dream images" ON storage.objects;
CREATE POLICY "Users can update own dream images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own dream images" ON storage.objects;
CREATE POLICY "Users can read own dream images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own dream images" ON storage.objects;
CREATE POLICY "Users can delete own dream images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'dream-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
