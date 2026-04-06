// Executa: node run-fill-descriptions.js <SERVICE_ROLE_KEY>
// Service role key: Supabase Dashboard → Settings → API → service_role

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SERVICE_KEY = process.argv[2];

if (!SERVICE_KEY) {
  console.error('Uso: node run-fill-descriptions.js <SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function getDescription(categoryName) {
  const n = (categoryName || '').toLowerCase();
  if (n.includes('pizza') || n.includes('pizz')) {
    return 'Pizza artesanal preparada con masa fresca, salsa de tomate y los mejores ingredientes.';
  }
  if (n.includes('pasta') || n.includes('fideos')) {
    return 'Pasta fresca elaborada al momento con ingredientes de primera calidad.';
  }
  if (n.includes('hamburgues') || n.includes('burger') || n.includes('hambúrguer')) {
    return 'Hamburguesa artesanal con carne de res jugosa, verduras frescas y nuestra salsa especial.';
  }
  if (n.includes('bebida') || n.includes('refresco') || n.includes('drink') || n.includes('refres')) {
    return 'Bebida refrescante para acompañar tu pedido. Servida bien fría.';
  }
  if (n.includes('postre') || n.includes('dulce') || n.includes('sobremesa') || n.includes('dessert')) {
    return 'Postre casero elaborado con ingredientes frescos. El toque dulce perfecto.';
  }
  if (n.includes('entrada') || n.includes('aperitivo') || n.includes('snack') || n.includes('tapa')) {
    return 'Entrada perfecta para comenzar. Preparada al momento con ingredientes selectos.';
  }
  if (n.includes('ensalada') || n.includes('salada') || n.includes('salad')) {
    return 'Ensalada fresca preparada al momento con verduras de temporada y aliño especial.';
  }
  if (n.includes('pollo') || n.includes('frango') || n.includes('chicken')) {
    return 'Preparado con pollo de primera calidad, cocinado al punto con especias de la casa.';
  }
  return 'Elaborado con ingredientes frescos y de primera calidad. Consulta nuestras opciones disponibles.';
}

async function run() {
  // 1. Buscar todas as categorias
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name');

  if (catErr) { console.error('Erro ao buscar categorias:', catErr); process.exit(1); }

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  // 2. Buscar produtos sem descrição
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, category_id, description')
    .or('description.is.null,description.eq.');

  if (prodErr) { console.error('Erro ao buscar produtos:', prodErr); process.exit(1); }

  if (!products || products.length === 0) {
    console.log('✅ Nenhum produto sem descrição encontrado.');
    return;
  }

  console.log(`📦 ${products.length} produto(s) sem descrição encontrado(s).`);

  // 3. Atualizar cada produto
  let updated = 0;
  for (const product of products) {
    const catName = catMap[product.category_id] || '';
    const description = getDescription(catName);

    const { error } = await supabase
      .from('products')
      .update({ description })
      .eq('id', product.id);

    if (error) {
      console.error(`❌ Erro ao atualizar "${product.name}":`, error.message);
    } else {
      console.log(`✅ "${product.name}" → ${description.slice(0, 60)}...`);
      updated++;
    }
  }

  console.log(`\n🎉 ${updated}/${products.length} produtos atualizados.`);
}

run().catch(console.error);
