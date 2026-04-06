-- ============================================================
-- SEED: Nova Loja de Hamburgueria Fictícia
-- Slug: burguer-mania | Nome: Burguer Mania
-- Hambúrgueres com 5 itens cada
-- ============================================================

-- 1. Criar tenant
INSERT INTO public.tenants (id, slug, plan, status)
VALUES ('22222222-2222-2222-2222-222222222222', 'burguer-mania', 'free', 'active')
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
  'Burguer Mania',
  'Hambúrgueres artesanais com ingredientes premium. Qualidade e sabor em cada mordida!',
  'Hamburgueria',
  3.00, 15.00, 'EUR',
  true, true,
  '22222222-2222-2222-2222-222222222222',
  'burguer-mania',
  'https://img.icons8.com/fluency/96/hamburger.png',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80'
)
ON CONFLICT DO NOTHING;

-- 3. Categorias
INSERT INTO public.categories (id, name, description, tenant_id)
VALUES
  ('bbbb0001-0000-0000-0000-000000000010', 'Hambúrgueres Premium', 'Nossos hambúrgueres artesanais especiais', '22222222-2222-2222-2222-222222222222'),
  ('bbbb0001-0000-0000-0000-000000000011', 'Bebidas', 'Bebidas para acompanhar seu pedido', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- 4. Criar 5 Hamburguesas com variações
INSERT INTO public.products (id, name, description, price, category_id, popular, vegetarian, tenant_id, position)
VALUES
  (
    'cccc0001-0000-0000-0000-000000000001',
    'Classic Burger Supreme',
    'O clássico que não sai de moda. Carne suculenta, alface, tomate, queijo derretido e molho secreto.',
    9.99,
    'bbbb0001-0000-0000-0000-000000000010',
    true, false,
    '22222222-2222-2222-2222-222222222222', 1
  ),
  (
    'cccc0001-0000-0000-0000-000000000002',
    'Double Bacon Gourmet',
    'Dupla de carnes suculentas, bacon crocante, cheddar derretido, cebola roxa e maionese especial.',
    13.99,
    'bbbb0001-0000-0000-0000-000000000010',
    true, false,
    '22222222-2222-2222-2222-222222222222', 2
  ),
  (
    'cccc0001-0000-0000-0000-000000000003',
    'Crispy Chicken Burger',
    'Peito de frango empanado crocante, alface, tomate, queijo suíço, maionese e molho barbecue.',
    11.99,
    'bbbb0001-0000-0000-0000-000000000010',
    false, false,
    '22222222-2222-2222-2222-222222222222', 3
  ),
  (
    'cccc0001-0000-0000-0000-000000000004',
    'Vegetariano Deluxe',
    'Hamburguesa vegana com abacate fresco, tomate, rúcula, cenoura ralada, gergelim e molho tahine.',
    10.99,
    'bbbb0001-0000-0000-0000-000000000010',
    false, true,
    '22222222-2222-2222-2222-222222222222', 4
  ),
  (
    'cccc0001-0000-0000-0000-000000000005',
    'Signature Picante',
    'Carne temperada extra, jalapeños, pimenta vermelha, cheddar picante, bacon e molho sriracha.',
    12.99,
    'bbbb0001-0000-0000-0000-000000000010',
    true, false,
    '22222222-2222-2222-2222-222222222222', 5
  )
ON CONFLICT DO NOTHING;

-- 5. Criar Grupo de Variações: TAMANHO
INSERT INTO public.variation_groups (id, title, description, tenant_id, position)
VALUES ('dddd0001-0000-0000-0000-000000000001', 'Tamanho', 'Escolha o tamanho do hamburguês', '22222222-2222-2222-2222-222222222222', 1)
ON CONFLICT DO NOTHING;

-- 6. Itens de Variação: TAMANHO
INSERT INTO public.variation_group_items (id, group_id, title, price, position)
VALUES
  ('eeee0001-0000-0000-0000-000000000001', 'dddd0001-0000-0000-0000-000000000001', 'Pequeno (110g)', 0.00, 1),
  ('eeee0001-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000001', 'Médio (150g)', 1.50, 2),
  ('eeee0001-0000-0000-0000-000000000003', 'dddd0001-0000-0000-0000-000000000001', 'Grande (200g)', 2.50, 3),
  ('eeee0001-0000-0000-0000-000000000004', 'dddd0001-0000-0000-0000-000000000001', 'XL (250g)', 3.50, 4)
ON CONFLICT DO NOTHING;

-- 7. Criar Grupo de Variações: ACOMPANHAMENTOS
INSERT INTO public.variation_groups (id, title, description, tenant_id, position)
VALUES ('dddd0002-0000-0000-0000-000000000002', 'Acompanhamentos', 'Escolha seus acompanhamentos favoritos', '22222222-2222-2222-2222-222222222222', 2)
ON CONFLICT DO NOTHING;

-- 8. Itens de Variação: ACOMPANHAMENTOS
INSERT INTO public.variation_group_items (id, group_id, title, price, position)
VALUES
  ('eeee0002-0000-0000-0000-000000000001', 'dddd0002-0000-0000-0000-000000000002', 'Batata Frita', 2.50, 1),
  ('eeee0002-0000-0000-0000-000000000002', 'dddd0002-0000-0000-0000-000000000002', 'Batata Doce', 3.00, 2),
  ('eeee0002-0000-0000-0000-000000000003', 'dddd0002-0000-0000-0000-000000000002', 'Anéis de Cebola', 2.80, 3),
  ('eeee0002-0000-0000-0000-000000000004', 'dddd0002-0000-0000-0000-000000000002', 'Salada', 2.00, 4),
  ('eeee0002-0000-0000-0000-000000000005', 'dddd0002-0000-0000-0000-000000000002', 'Nuggets (6 un.)', 4.00, 5)
ON CONFLICT DO NOTHING;

-- 9. Criar Grupo de Variações: MOLHOS
INSERT INTO public.variation_groups (id, title, description, tenant_id, position)
VALUES ('dddd0003-0000-0000-0000-000000000003', 'Molhos Extras', 'Adicionar molhos especiais', '22222222-2222-2222-2222-222222222222', 3)
ON CONFLICT DO NOTHING;

-- 10. Itens de Variação: MOLHOS
INSERT INTO public.variation_group_items (id, group_id, title, price, position)
VALUES
  ('eeee0003-0000-0000-0000-000000000001', 'dddd0003-0000-0000-0000-000000000003', 'Molho Barbecue', 0.50, 1),
  ('eeee0003-0000-0000-0000-000000000002', 'dddd0003-0000-0000-0000-000000000003', 'Molho Sriracha', 0.75, 2),
  ('eeee0003-0000-0000-0000-000000000003', 'dddd0003-0000-0000-0000-000000000003', 'Maionese Alho', 0.50, 3),
  ('eeee0003-0000-0000-0000-000000000004', 'dddd0003-0000-0000-0000-000000000003', 'Molho Mostarda Mel', 0.60, 4)
ON CONFLICT DO NOTHING;

-- 11. Criar Grupo de Variações: QUEIJOS
INSERT INTO public.variation_groups (id, title, description, tenant_id, position)
VALUES ('dddd0004-0000-0000-0000-000000000004', 'Seleção de Queijos', 'Escolha seus queijos favoritos', '22222222-2222-2222-2222-222222222222', 4)
ON CONFLICT DO NOTHING;

-- 12. Itens de Variação: QUEIJOS
INSERT INTO public.variation_group_items (id, group_id, title, price, position)
VALUES
  ('eeee0004-0000-0000-0000-000000000001', 'dddd0004-0000-0000-0000-000000000004', 'Queijo Cheddar', 1.00, 1),
  ('eeee0004-0000-0000-0000-000000000002', 'dddd0004-0000-0000-0000-000000000004', 'Queijo Suíço', 1.50, 2),
  ('eeee0004-0000-0000-0000-000000000003', 'dddd0004-0000-0000-0000-000000000004', 'Queijo Gorgonzola', 2.00, 3),
  ('eeee0004-0000-0000-0000-000000000004', 'dddd0004-0000-0000-0000-000000000004', 'Duplo Queijo', 1.50, 4)
ON CONFLICT DO NOTHING;

-- 13. Criar Grupo de Variações: BEBIDAS
INSERT INTO public.variation_groups (id, title, description, tenant_id, position)
VALUES ('dddd0005-0000-0000-0000-000000000005', 'Bebidas', 'Escolha uma bebida refrescante', '22222222-2222-2222-2222-222222222222', 5)
ON CONFLICT DO NOTHING;

-- 14. Itens de Variação: BEBIDAS
INSERT INTO public.variation_group_items (id, group_id, title, price, position)
VALUES
  ('eeee0005-0000-0000-0000-000000000001', 'dddd0005-0000-0000-0000-000000000005', 'Refrigerante Lata', 2.00, 1),
  ('eeee0005-0000-0000-0000-000000000002', 'dddd0005-0000-0000-0000-000000000005', 'Suco Natural', 2.50, 2),
  ('eeee0005-0000-0000-0000-000000000003', 'dddd0005-0000-0000-0000-000000000005', 'Água com Gás', 1.50, 3),
  ('eeee0005-0000-0000-0000-000000000004', 'dddd0005-0000-0000-0000-000000000005', 'Cerveja Artesanal', 3.50, 4),
  ('eeee0005-0000-0000-0000-000000000005', 'dddd0005-0000-0000-0000-000000000005', 'Milkshake', 4.00, 5)
ON CONFLICT DO NOTHING;

-- 15. Associar Grupos de Variação aos Produtos (Aplicar a todos os 5 hambúrgueres)
INSERT INTO public.product_variation_groups (product_id, variation_group_id, position)
VALUES
  ('cccc0001-0000-0000-0000-000000000001', 'dddd0001-0000-0000-0000-000000000001', 1),
  ('cccc0001-0000-0000-0000-000000000001', 'dddd0002-0000-0000-0000-000000000002', 2),
  ('cccc0001-0000-0000-0000-000000000001', 'dddd0003-0000-0000-0000-000000000003', 3),
  ('cccc0001-0000-0000-0000-000000000001', 'dddd0004-0000-0000-0000-000000000004', 4),
  ('cccc0001-0000-0000-0000-000000000001', 'dddd0005-0000-0000-0000-000000000005', 5),
  
  ('cccc0001-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000001', 1),
  ('cccc0001-0000-0000-0000-000000000002', 'dddd0002-0000-0000-0000-000000000002', 2),
  ('cccc0001-0000-0000-0000-000000000002', 'dddd0003-0000-0000-0000-000000000003', 3),
  ('cccc0001-0000-0000-0000-000000000002', 'dddd0004-0000-0000-0000-000000000004', 4),
  ('cccc0001-0000-0000-0000-000000000002', 'dddd0005-0000-0000-0000-000000000005', 5),
  
  ('cccc0001-0000-0000-0000-000000000003', 'dddd0001-0000-0000-0000-000000000001', 1),
  ('cccc0001-0000-0000-0000-000000000003', 'dddd0002-0000-0000-0000-000000000002', 2),
  ('cccc0001-0000-0000-0000-000000000003', 'dddd0003-0000-0000-0000-000000000003', 3),
  ('cccc0001-0000-0000-0000-000000000003', 'dddd0004-0000-0000-0000-000000000004', 4),
  ('cccc0001-0000-0000-0000-000000000003', 'dddd0005-0000-0000-0000-000000000005', 5),
  
  ('cccc0001-0000-0000-0000-000000000004', 'dddd0001-0000-0000-0000-000000000001', 1),
  ('cccc0001-0000-0000-0000-000000000004', 'dddd0002-0000-0000-0000-000000000002', 2),
  ('cccc0001-0000-0000-0000-000000000004', 'dddd0003-0000-0000-0000-000000000003', 3),
  ('cccc0001-0000-0000-0000-000000000004', 'dddd0004-0000-0000-0000-000000000004', 4),
  ('cccc0001-0000-0000-0000-000000000004', 'dddd0005-0000-0000-0000-000000000005', 5),
  
  ('cccc0001-0000-0000-0000-000000000005', 'dddd0001-0000-0000-0000-000000000001', 1),
  ('cccc0001-0000-0000-0000-000000000005', 'dddd0002-0000-0000-0000-000000000002', 2),
  ('cccc0001-0000-0000-0000-000000000005', 'dddd0003-0000-0000-0000-000000000003', 3),
  ('cccc0001-0000-0000-0000-000000000005', 'dddd0004-0000-0000-0000-000000000004', 4),
  ('cccc0001-0000-0000-0000-000000000005', 'dddd0005-0000-0000-0000-000000000005', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- CONFIRMAÇÃO
-- ============================================================
-- SELECT 'Loja criada com sucesso!' as resultado;
