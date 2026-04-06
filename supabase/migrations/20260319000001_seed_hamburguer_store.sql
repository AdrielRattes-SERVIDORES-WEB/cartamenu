-- ============================================================
-- SEED: Loja de Hamburgueria de demonstração
-- Slug: burguerhouse | Idioma: Espanhol
-- ============================================================

-- 1. Criar tenant
INSERT INTO public.tenants (id, slug, plan, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'burguerhouse', 'free', 'active')
ON CONFLICT (slug) DO NOTHING;

-- 2. Criar store_info
INSERT INTO public.store_info (
  name, description, cuisine_type,
  delivery_fee, min_order, currency,
  enable_delivery, enable_pickup,
  tenant_id, slug,
  logo, banner
)
VALUES (
  'BurguerHouse',
  'Las mejores hamburguesas artesanales de la ciudad. Ingredientes frescos, sabor incomparable.',
  'Hamburguesería',
  2.50, 10.00, 'EUR',
  true, true,
  '11111111-1111-1111-1111-111111111111',
  'burguerhouse',
  'https://img.icons8.com/fluency/96/hamburger.png',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80'
)
ON CONFLICT DO NOTHING;

-- 3. Categorias
INSERT INTO public.categories (id, name, description, tenant_id)
VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'Hamburguesas', 'Nuestras hamburguesas artesanales', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0001-0000-0000-0000-000000000002', 'Refrescos',    'Bebidas frías para acompañar',      '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 4. Hamburguesas (5)
INSERT INTO public.products (id, name, description, price, category_id, popular, vegetarian, tenant_id, position)
VALUES
  (
    'bbbb0001-0000-0000-0000-000000000001',
    'Clásica BurguerHouse',
    'Carne de res 180g, lechuga, tomate, pepinillo, cebolla caramelizada y salsa de la casa.',
    9.90,
    'aaaa0001-0000-0000-0000-000000000001',
    true, false,
    '11111111-1111-1111-1111-111111111111', 1
  ),
  (
    'bbbb0001-0000-0000-0000-000000000002',
    'Doble Fuego',
    'Doble carne 360g, queso cheddar derretido, jalapeños, bacon crujiente y mayonesa picante.',
    13.50,
    'aaaa0001-0000-0000-0000-000000000001',
    true, false,
    '11111111-1111-1111-1111-111111111111', 2
  ),
  (
    'bbbb0001-0000-0000-0000-000000000003',
    'Smoky BBQ',
    'Carne de res 180g, salsa BBQ ahumada, bacon, anillo de cebolla crujiente y queso gouda.',
    11.90,
    'aaaa0001-0000-0000-0000-000000000001',
    false, false,
    '11111111-1111-1111-1111-111111111111', 3
  ),
  (
    'bbbb0001-0000-0000-0000-000000000004',
    'Veggie Deluxe',
    'Hamburguesa de garbanzos y espinacas, aguacate, tomate cherry, rúcula y alioli de limón.',
    10.50,
    'aaaa0001-0000-0000-0000-000000000001',
    false, true,
    '11111111-1111-1111-1111-111111111111', 4
  ),
  (
    'bbbb0001-0000-0000-0000-000000000005',
    'Truffle Gourmet',
    'Carne Angus 200g, queso brie, rúcula, tomate seco, mayonesa de trufa negra y pan brioche.',
    15.90,
    'aaaa0001-0000-0000-0000-000000000001',
    true, false,
    '11111111-1111-1111-1111-111111111111', 5
  )
ON CONFLICT DO NOTHING;

-- 5. Refrescos (5)
INSERT INTO public.products (id, name, description, price, category_id, popular, vegetarian, tenant_id, position)
VALUES
  (
    'bbbb0002-0000-0000-0000-000000000001',
    'Coca-Cola',
    'Refresco de cola clásico. Lata 330ml bien fría.',
    2.20,
    'aaaa0001-0000-0000-0000-000000000002',
    true, true,
    '11111111-1111-1111-1111-111111111111', 6
  ),
  (
    'bbbb0002-0000-0000-0000-000000000002',
    'Coca-Cola Zero',
    'Todo el sabor sin azúcar. Lata 330ml.',
    2.20,
    'aaaa0001-0000-0000-0000-000000000002',
    false, true,
    '11111111-1111-1111-1111-111111111111', 7
  ),
  (
    'bbbb0002-0000-0000-0000-000000000003',
    'Fanta Naranja',
    'Refresco de naranja con burbujas. Lata 330ml.',
    2.00,
    'aaaa0001-0000-0000-0000-000000000002',
    false, true,
    '11111111-1111-1111-1111-111111111111', 8
  ),
  (
    'bbbb0002-0000-0000-0000-000000000004',
    'Agua con Gas',
    'Agua mineral con gas natural. Botella 500ml.',
    1.80,
    'aaaa0001-0000-0000-0000-000000000002',
    false, true,
    '11111111-1111-1111-1111-111111111111', 9
  ),
  (
    'bbbb0002-0000-0000-0000-000000000005',
    'Limonada Casera',
    'Limonada fresca preparada en casa con limón natural, menta y hielo. 400ml.',
    3.50,
    'aaaa0001-0000-0000-0000-000000000002',
    true, true,
    '11111111-1111-1111-1111-111111111111', 10
  )
ON CONFLICT DO NOTHING;
