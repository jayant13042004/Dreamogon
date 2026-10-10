-- Migration 010: Dream Audio Storage & Metadata (Corrected)
-- Creates the private 'dream-audio' bucket, storage RLS policies, and dream table audio columns.

-- 1. Add audio metadata columns to public.dreams
ALTER TABLE public.dreams
  ADD COLUMN IF NOT EXISTS audio_path text,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds numeric(8, 2),
  ADD COLUMN IF NOT EXISTS audio_mime_type text,
  ADD COLUMN IF NOT EXISTS audio_file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS transcription_status text DEFAULT 'none' CHECK (transcription_status IN ('none', 'transcribing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS raw_transcript text,
  ADD COLUMN IF NOT EXISTS client_local_id text;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_dreams_audio_path
  ON public.dreams(audio_path)
  WHERE audio_path IS NOT NULL;

-- Unique constraint per user on client_local_id for strict race-condition/idempotency protection
CREATE UNIQUE INDEX IF NOT EXISTS idx_dreams_user_client_local_id
  ON public.dreams(user_id, client_local_id)
  WHERE client_local_id IS NOT NULL;

-- 3. Create private 'dream-audio' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dream-audio',
  'dream-audio',
  false,
  52428800, -- 50 MB
  ARRAY['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/x-m4a', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload own dream audio" ON storage.objects;
CREATE POLICY "Users can upload own dream audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dream-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own dream audio" ON storage.objects;
CREATE POLICY "Users can read own dream audio"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dream-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own dream audio" ON storage.objects;
CREATE POLICY "Users can update own dream audio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'dream-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own dream audio" ON storage.objects;
CREATE POLICY "Users can delete own dream audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'dream-audio'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
