-- Add Stripe configuration columns to store_info table
ALTER TABLE public.store_info
ADD COLUMN IF NOT EXISTS stripe_publishable_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_secret_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_webhook_secret text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_mode text DEFAULT 'test';

-- Create index on stripe_mode for faster queries
CREATE INDEX IF NOT EXISTS idx_store_info_stripe_mode ON public.store_info(stripe_mode);
