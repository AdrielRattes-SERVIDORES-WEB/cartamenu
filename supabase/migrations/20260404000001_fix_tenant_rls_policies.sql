-- ============================================================
-- FIX: Políticas RLS com isolamento real por tenant_id
-- Substitui políticas abertas demais por políticas que filtram
-- apenas dados do tenant correto
-- ============================================================

-- ── products ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public select products" ON public.products;

CREATE POLICY "Public select products by active tenant"
  ON public.products FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Admins can manage own tenant products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = products.tenant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = products.tenant_id
    )
  );

-- ── categories ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public select categories" ON public.categories;

CREATE POLICY "Public select categories by active tenant"
  ON public.categories FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Admins can manage own tenant categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = categories.tenant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = categories.tenant_id
    )
  );

-- ── orders ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Admins can view own tenant orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = orders.tenant_id
    )
  );

CREATE POLICY "Admins can update own tenant orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND tenant_id = orders.tenant_id
    )
  );

-- Clientes podem ver seus próprios pedidos
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid());

-- Inserção de novos pedidos (checkout público)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- ── variation_groups ─────────────────────────────────────────
DROP POLICY IF EXISTS "Allow public read" ON public.variation_groups;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.variation_groups;

CREATE POLICY "Public read variation_groups by active tenant"
  ON public.variation_groups FOR SELECT
  USING (
    tenant_id IS NULL OR tenant_id IN (
      SELECT id FROM public.tenants WHERE status = 'active'
    )
  );

CREATE POLICY "Admins can manage own tenant variation_groups"
  ON public.variation_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (variation_groups.tenant_id IS NULL OR tenant_id = variation_groups.tenant_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
