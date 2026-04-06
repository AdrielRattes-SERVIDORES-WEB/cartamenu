-- ============================================================
-- FILL: Preencher descrições em branco nos produtos
-- Aplica placeholder em espanhol para todos os tenants
-- ============================================================

UPDATE public.products
SET description = CASE
  -- Detectar pela categoria (join implícito pelo category_id)
  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%pizza%' OR LOWER(name) LIKE '%pizz%'
  ) THEN 'Pizza artesanal preparada con masa fresca, salsa de tomate y los mejores ingredientes.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%pasta%' OR LOWER(name) LIKE '%fideos%'
  ) THEN 'Pasta fresca elaborada al momento con ingredientes de primera calidad.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%hamburgues%' OR LOWER(name) LIKE '%burger%' OR LOWER(name) LIKE '%hambúrguer%'
  ) THEN 'Hamburguesa artesanal con carne de res jugosa, verduras frescas y nuestra salsa especial.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%bebida%' OR LOWER(name) LIKE '%refresco%' OR LOWER(name) LIKE '%drink%'
  ) THEN 'Bebida refrescante para acompañar tu pedido. Servida bien fría.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%postre%' OR LOWER(name) LIKE '%dulce%' OR LOWER(name) LIKE '%sobremesa%'
  ) THEN 'Postre casero elaborado con ingredientes frescos. El toque dulce perfecto.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%entrada%' OR LOWER(name) LIKE '%aperitivo%' OR LOWER(name) LIKE '%snack%'
  ) THEN 'Entrada perfecta para comenzar. Preparada al momento con ingredientes selectos.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%ensalada%' OR LOWER(name) LIKE '%salada%'
  ) THEN 'Ensalada fresca preparada al momento con verduras de temporada y aliño especial.'

  WHEN category_id IN (
    SELECT id FROM public.categories
    WHERE LOWER(name) LIKE '%pollo%' OR LOWER(name) LIKE '%frango%' OR LOWER(name) LIKE '%chicken%'
  ) THEN 'Preparado con pollo de primera calidad, cocinado al punto con especias de la casa.'

  ELSE 'Elaborado con ingredientes frescos y de primera calidad. Personaliza tu pedido con las opciones disponibles.'
END
WHERE description IS NULL OR TRIM(description) = '';
