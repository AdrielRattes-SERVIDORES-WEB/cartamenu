-- Corrige constraint única em categories para permitir mesmo nome em tenants diferentes
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_tenant_unique ON public.categories (name, tenant_id);
