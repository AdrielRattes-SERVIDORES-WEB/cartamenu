-- Create variation_groups table
CREATE TABLE IF NOT EXISTS public.variation_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_i18n jsonb,
  description text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create variation_group_items table
CREATE TABLE IF NOT EXISTS public.variation_group_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.variation_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  title_i18n jsonb,
  price numeric(10,2) DEFAULT 0,
  sku text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_variation_groups junction table (N:N relationship)
CREATE TABLE IF NOT EXISTS public.product_variation_groups (
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variation_group_id uuid REFERENCES public.variation_groups(id) ON DELETE CASCADE,
  position integer DEFAULT 0,
  PRIMARY KEY (product_id, variation_group_id)
);

-- Add position column to products table for menu ordering
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Add position column to option_variations table
ALTER TABLE public.option_variations
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_variation_groups_position ON public.variation_groups(position);
CREATE INDEX IF NOT EXISTS idx_variation_group_items_group_id ON public.variation_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_variation_group_items_position ON public.variation_group_items(position);
CREATE INDEX IF NOT EXISTS idx_product_variation_groups_product_id ON public.product_variation_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variation_groups_variation_group_id ON public.product_variation_groups(variation_group_id);
CREATE INDEX IF NOT EXISTS idx_products_position ON public.products(position);
CREATE INDEX IF NOT EXISTS idx_option_variations_position ON public.option_variations(position);

-- Enable RLS on new tables
ALTER TABLE public.variation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variation_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for variation_groups
CREATE POLICY "Allow public read" ON public.variation_groups
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON public.variation_groups
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for variation_group_items
CREATE POLICY "Allow public read" ON public.variation_group_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON public.variation_group_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for product_variation_groups
CREATE POLICY "Allow public read" ON public.product_variation_groups
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON public.product_variation_groups
  FOR ALL USING (auth.role() = 'authenticated');
