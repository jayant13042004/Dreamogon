-- ==============================================================================
-- Migration 011: Multi-Segment Dream Capture Architecture
-- Adds public.dream_segments to support non-destructive multi-segment dream capture
-- (e.g. "Anything else you remember?") without overwriting original audio or notes.
-- ==============================================================================

-- 1. Create dream_segments table
CREATE TABLE IF NOT EXISTS public.dream_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id uuid NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_index integer NOT NULL DEFAULT 0,
  segment_type text NOT NULL CHECK (segment_type IN ('voice', 'text')),
  content text NOT NULL,
  raw_transcript text,
  audio_path text,
  audio_duration_seconds numeric(8, 2),
  audio_mime_type text,
  audio_file_size_bytes bigint,
  transcription_status text DEFAULT 'none' CHECK (transcription_status IN ('none', 'transcribing', 'completed', 'failed')),
  client_local_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Indexes

-- Primary client-generated idempotency key: ensures concurrent retries or duplicate network requests
-- never create duplicate segment records for a given dream
CREATE UNIQUE INDEX IF NOT EXISTS idx_dream_segments_dream_client_local_id
  ON public.dream_segments(dream_id, client_local_id)
  WHERE client_local_id IS NOT NULL;

-- Ordering index for fast retrieval of segments by dream in chronological sequence
CREATE INDEX IF NOT EXISTS idx_dream_segments_dream_order
  ON public.dream_segments(dream_id, segment_index ASC);

-- Foreign key lookup index for user queries
CREATE INDEX IF NOT EXISTS idx_dream_segments_user_id
  ON public.dream_segments(user_id);

-- Audio path lookup index
CREATE INDEX IF NOT EXISTS idx_dream_segments_audio_path
  ON public.dream_segments(audio_path)
  WHERE audio_path IS NOT NULL;

-- 3. Row Level Security (RLS)
ALTER TABLE public.dream_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own dream segments" ON public.dream_segments;
CREATE POLICY "Users can read own dream segments"
  ON public.dream_segments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dream segments" ON public.dream_segments;
CREATE POLICY "Users can insert own dream segments"
  ON public.dream_segments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dream segments" ON public.dream_segments;
CREATE POLICY "Users can update own dream segments"
  ON public.dream_segments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dream segments" ON public.dream_segments;
CREATE POLICY "Users can delete own dream segments"
  ON public.dream_segments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. Backfill: Uniformly create segment 0 for all existing dreams
-- Ensures 100% backward compatibility so all past dreams behave identically in multi-segment views
INSERT INTO public.dream_segments (
  dream_id,
  user_id,
  segment_index,
  segment_type,
  content,
  raw_transcript,
  audio_path,
  audio_duration_seconds,
  audio_mime_type,
  audio_file_size_bytes,
  transcription_status,
  client_local_id,
  created_at,
  updated_at
)
SELECT
  d.id,
  d.user_id,
  0,
  CASE WHEN d.audio_path IS NOT NULL THEN 'voice' ELSE 'text' END,
  d.content,
  d.raw_transcript,
  d.audio_path,
  d.audio_duration_seconds,
  d.audio_mime_type,
  d.audio_file_size_bytes,
  COALESCE(d.transcription_status, 'none'),
  CASE WHEN d.client_local_id IS NOT NULL THEN d.client_local_id || '-seg-0' ELSE NULL END,
  d.created_at,
  d.updated_at
FROM public.dreams d
WHERE NOT EXISTS (
  SELECT 1 FROM public.dream_segments s WHERE s.dream_id = d.id AND s.segment_index = 0
);
