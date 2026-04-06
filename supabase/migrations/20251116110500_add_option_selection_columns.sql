-- Add support for option selection rules (allow multiple, min/max selections)
ALTER TABLE public.product_options
ADD COLUMN IF NOT EXISTS allow_multiple boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_selections integer,
ADD COLUMN IF NOT EXISTS max_selections integer;

-- Ensure existing rows have defaults (min/max nullable)
UPDATE public.product_options
SET allow_multiple = COALESCE(allow_multiple, false);

-- Optionally add any indices if needed (left disabled here)
-- CREATE INDEX IF NOT EXISTS idx_product_options_allow_multiple ON public.product_options (allow_multiple);
