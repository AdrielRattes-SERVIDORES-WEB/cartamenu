-- Tabela de tenants (lojas)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  owner_id UUID REFERENCES auth.users(id),
  -- Stripe por tenant
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_mode TEXT DEFAULT 'test',
  -- PayPal por tenant
  paypal_client_id TEXT,
  paypal_secret TEXT,
  paypal_mode TEXT DEFAULT 'sandbox',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar store_id em store_info
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Adicionar store_id nas tabelas principais
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.variation_groups ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON public.orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_store_info_tenant_id ON public.store_info(tenant_id);

-- RLS para tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active tenants" ON public.tenants FOR SELECT USING (status = 'active');
CREATE POLICY "Owner can update their tenant" ON public.tenants FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Tabela de roles com tenant_id
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON public.user_roles(tenant_id);

-- Superadmin role (add to enum if not exists)
DO $$ BEGIN
  ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION WHEN others THEN NULL;
END $$;
