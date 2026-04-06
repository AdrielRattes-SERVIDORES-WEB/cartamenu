// seed-stores.js — Cria 3 lojas demo com categorias e produtos
// Uso: node seed-stores.js

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const stores = [
  {
    slug: 'elreydelasador',
    storeName: 'El Rey del Asador',
    ownerEmail: 'admin@elreydelasador.com',
    ownerPassword: 'Admin1234!',
    ownerName: 'Admin Asador',
    description: 'Pollos asados a la leña con receta secreta de especias',
    cuisineType: 'Pollos Asados',
    categories: [
      {
        name: 'Pollos',
        products: [
          { name: 'Pollo Asado Entero', description: 'Pollo a la leña con receta secreta de especias.', price: 12.90, popular: true },
        ]
      },
      {
        name: 'Guarniciones',
        products: [
          { name: 'Ración de Patatas Asadas', description: 'Patatas cortadas a mano, asadas al horno con el jugo del pollo.', price: 4.50, popular: true },
          { name: 'Croquetas de Jamón', description: '6 unidades de croquetas cremosas con jamón ibérico.', price: 5.90, popular: false },
          { name: 'Ensaladilla Rusa', description: 'Receta artesana con patata, atún y mayonesa suave.', price: 4.90, popular: false },
        ]
      },
      {
        name: 'Menús',
        products: [
          { name: 'Menú Familiar', description: 'Pollo entero + Ración de patatas + Bebida de 1.5L.', price: 18.90, popular: true },
        ]
      }
    ]
  },
  {
    slug: 'bacobrasa',
    storeName: 'Baco & Brasa',
    ownerEmail: 'admin@bacobrasa.com',
    ownerPassword: 'Admin1234!',
    ownerName: 'Admin Baco',
    description: 'Hamburguesería artesana con ingredientes de primera',
    cuisineType: 'Hamburguesería',
    categories: [
      {
        name: 'Burgers',
        products: [
          { name: 'Burger Clásica', description: '180g de ternera, queso, lechuga, tomate y salsa de la casa.', price: 9.90, popular: true },
          { name: 'Smash Burger Doble', description: 'Dos carnes de 90g, doble de queso cheddar y cebolla caramelizada.', price: 12.50, popular: true },
        ]
      },
      {
        name: 'Acompañamientos',
        products: [
          { name: 'Patatas con Bacon y Queso', description: 'Ración grande de patatas fritas cubiertas de queso fundido y bacon crujiente.', price: 6.50, popular: true },
          { name: 'Tequeños con Salsa', description: '5 palitos de queso crujientes con salsa de guayaba.', price: 5.90, popular: false },
        ]
      },
      {
        name: 'Postres',
        products: [
          { name: 'Tarta de Queso Fluida', description: 'Porción de tarta de queso casera con corazón cremoso.', price: 4.90, popular: false },
        ]
      }
    ]
  },
  {
    slug: 'lacriolla',
    storeName: 'La Criolla',
    ownerEmail: 'admin@lacriolla.com',
    ownerPassword: 'Admin1234!',
    ownerName: 'Admin Criolla',
    description: 'Empanadas argentinas artesanas, hechas con amor',
    cuisineType: 'Empanadas Argentinas',
    categories: [
      {
        name: 'Empanadas',
        products: [
          { name: 'Empanada de Carne Suave', description: 'Ternera picada con cebolla, pimiento y especias suaves.', price: 2.50, popular: true },
          { name: 'Empanada de Carne Picante', description: 'Ternera con ají molido, comino y un toque de picante.', price: 2.50, popular: true },
          { name: 'Empanada de Jamón y Queso', description: 'Jamón york y queso mozzarella fundido en masa crujiente.', price: 2.50, popular: false },
          { name: 'Empanada de Verduras', description: 'Espinacas, queso ricotta, champiñones y tomate seco.', price: 2.50, popular: false },
          { name: 'Empanada de Pollo', description: 'Pollo deshilachado con cebolla, pimiento rojo y aceitunas.', price: 2.50, popular: false },
        ]
      },
      {
        name: 'Bandejas',
        products: [
          { name: 'Bandeja 6 Empanadas', description: 'Elige 6 empanadas de cualquier sabor.', price: 13.90, popular: true },
          { name: 'Bandeja 12 Empanadas', description: 'Elige 12 empanadas de cualquier sabor. ¡Ideal para compartir!', price: 25.90, popular: true },
        ]
      },
      {
        name: 'Postres',
        products: [
          { name: 'Alfajor de Maicena', description: 'Galletas de maicena rellenas de dulce de leche y bañadas en coco.', price: 2.20, popular: false },
          { name: 'Dulce de Leche (Tarro)', description: 'Tarro de 250g de dulce de leche artesano argentino.', price: 5.50, popular: false },
        ]
      }
    ]
  }
];

async function post(path, body, token) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token || ANON_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function createTenant(store) {
  console.log(`\n[${store.storeName}] Criando tenant...`);
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
    body: JSON.stringify({
      slug: store.slug,
      storeName: store.storeName,
      ownerEmail: store.ownerEmail,
      ownerPassword: store.ownerPassword,
      ownerName: store.ownerName,
      plan: 'free',
    }),
  });
  const data = await res.json();
  if (data.error) {
    if (data.error.includes('Slug já em uso')) {
      console.log(`  ↳ Slug "${store.slug}" já existe, continuando...`);
      return true;
    }
    console.error(`  ✗ Erro: ${data.error}`);
    return false;
  }
  console.log(`  ✓ Tenant criado: ${data.tenant?.id}`);
  return true;
}

async function updateStoreInfo(tenantId, store, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/store_info?tenant_id=eq.${tenantId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      description: store.description,
      cuisine_type: store.cuisineType,
    }),
  });
  return res.json();
}

async function getUser(token) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

async function getTenantId(token) {
  const user = await getUser(token);
  if (!user?.id) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id,slug&status=eq.active&owner_id=eq.${user.id}`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return data[0];
}

async function insertCategory(name, tenantId, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ name, tenant_id: tenantId }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function insertProduct(product, categoryId, tenantId, position, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      name: product.name,
      description: product.description,
      price: product.price,
      popular: product.popular || false,
      category_id: categoryId,
      tenant_id: tenantId,
      position,
    }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function seedStore(store) {
  // 1. Create tenant
  const created = await createTenant(store);
  if (!created) return;

  // 2. Sign in as admin
  console.log(`  Fazendo login como ${store.ownerEmail}...`);
  const auth = await signIn(store.ownerEmail, store.ownerPassword);
  if (!auth.access_token) {
    console.error(`  ✗ Falha no login:`, auth);
    return;
  }
  const token = auth.access_token;
  console.log(`  ✓ Login OK`);

  // 3. Get tenant ID
  const tenant = await getTenantId(token);
  if (!tenant) {
    console.error(`  ✗ Tenant não encontrado`);
    return;
  }
  const tenantId = tenant.id;
  console.log(`  ✓ Tenant ID: ${tenantId}`);

  // 4. Update store info
  await updateStoreInfo(tenantId, store, token);
  console.log(`  ✓ Store info atualizado`);

  // 5. Check existing categories
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?tenant_id=eq.${tenantId}&select=name`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
  const existingCats = await catRes.json();
  const existingCatNames = existingCats.map(c => c.name);

  // 6. Insert categories and products
  let pos = 1;
  for (const cat of store.categories) {
    if (existingCatNames.includes(cat.name)) {
      console.log(`  ↳ Categoria "${cat.name}" já existe, pulando...`);
      continue;
    }
    const category = await insertCategory(cat.name, tenantId, token);
    if (!category?.id) {
      console.error(`  ✗ Erro ao criar categoria "${cat.name}":`, category);
      continue;
    }
    console.log(`  ✓ Categoria "${cat.name}" criada`);

    for (const product of cat.products) {
      const p = await insertProduct(product, category.id, tenantId, pos++, token);
      if (p?.id) {
        console.log(`    ✓ Produto "${product.name}" (${product.price}€)`);
      } else {
        console.error(`    ✗ Erro produto "${product.name}":`, p);
      }
    }
  }

  console.log(`  ✅ Loja "${store.storeName}" concluída → localhost:8081/${store.slug}`);
}

(async () => {
  console.log('=== Seed de lojas demo ===\n');
  for (const store of stores) {
    await seedStore(store);
  }
  console.log('\n=== Concluído ===');
})();
