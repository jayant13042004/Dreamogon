-- Add Visual Memory Image columns to Dreams table
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS image_prompt text,
ADD COLUMN IF NOT EXISTS image_generated_at timestamptz,
ADD COLUMN IF NOT EXISTS image_generation_count int DEFAULT 0;

-- Index for quickly finding dreams with generated visuals
CREATE INDEX IF NOT EXISTS idx_dreams_image_url ON public.dreams(image_url) WHERE image_url IS NOT NULL;
