// fix-and-seed.js
const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MDQzMiwiZXhwIjoyMDYyNzQ2NDMyfQ.bUvvIbSHPHR_EDwzx52z0yzA9XgUigi1IYDYVFctuV4';

const wrongNames = ['Pollos','Guarniciones','Menús','Burgers','Acompañamientos','Postres','Empanadas','Bandejas'];
const BURGUER_TENANT = '11111111-1111-1111-1111-111111111111';

async function req(method, path, body, token) {
  const url = SUPABASE_URL + path;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': token || SRK,
    'Authorization': 'Bearer ' + (token || SRK),
    'Prefer': 'return=representation',
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  const text = await r.text();
  try { return { status: r.status, data: JSON.parse(text) }; }
  catch { return { status: r.status, data: text }; }
}

async function signIn(email, password) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  return r.json();
}

async function getUser(token) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + token },
  });
  return r.json();
}

// Delete wrong categories one by one using service role
async function cleanupWrongCategories() {
  console.log('\n[Cleanup] Deletando categorias criadas no tenant errado...');
  for (const name of wrongNames) {
    const r = await req('DELETE', `/rest/v1/categories?tenant_id=eq.${BURGUER_TENANT}&name=eq.${encodeURIComponent(name)}`);
    console.log(`  DELETE "${name}": ${r.status}`);
  }
}

// Apply constraint fix via Supabase pg REST (using service role on rpc)
async function fixConstraint() {
  console.log('\n[Migration] Corrigindo unique constraint...');
  // Try to use pg RPC if available
  const r = await req('POST', '/rest/v1/rpc/exec_sql', { sql: 'SELECT 1' });
  if (r.status === 404) {
    console.log('  RPC exec_sql não disponível — constraint será ignorada se já foi dropada');
    return;
  }
}

const stores = [
  {
    slug: 'elreydelasador',
    storeName: 'El Rey del Asador',
    ownerEmail: 'admin@elreydelasador.com',
    ownerPassword: 'Admin1234!',
    description: 'Pollos asados a la leña con receta secreta de especias',
    cuisineType: 'Pollos Asados',
    deliveryFee: 2.50,
    minOrder: 10.00,
    categories: [
      { name: 'Pollos', products: [
        { name: 'Pollo Asado Entero', description: 'Pollo a la leña con receta secreta de especias.', price: 12.90, popular: true },
      ]},
      { name: 'Guarniciones', products: [
        { name: 'Ración de Patatas Asadas', description: 'Patatas cortadas a mano, asadas al horno con el jugo del pollo.', price: 4.50, popular: true },
        { name: 'Croquetas de Jamón', description: '6 unidades de croquetas cremosas con jamón ibérico.', price: 5.90, popular: false },
        { name: 'Ensaladilla Rusa', description: 'Receta artesana con patata, atún y mayonesa suave.', price: 4.90, popular: false },
      ]},
      { name: 'Menús', products: [
        { name: 'Menú Familiar', description: 'Pollo entero + Ración de patatas + Bebida de 1.5L.', price: 18.90, popular: true },
      ]},
    ]
  },
  {
    slug: 'bacobrasa',
    storeName: 'Baco & Brasa',
    ownerEmail: 'admin@bacobrasa.com',
    ownerPassword: 'Admin1234!',
    description: 'Hamburguesería artesana con ingredientes de primera',
    cuisineType: 'Hamburguesería',
    deliveryFee: 2.00,
    minOrder: 12.00,
    categories: [
      { name: 'Burgers', products: [
        { name: 'Burger Clásica', description: '180g de ternera, queso, lechuga, tomate y salsa de la casa.', price: 9.90, popular: true },
        { name: 'Smash Burger Doble', description: 'Dos carnes de 90g, doble de queso cheddar y cebolla caramelizada.', price: 12.50, popular: true },
      ]},
      { name: 'Acompañamientos', products: [
        { name: 'Patatas con Bacon y Queso', description: 'Ración grande de patatas fritas cubiertas de queso fundido y bacon crujiente.', price: 6.50, popular: true },
        { name: 'Tequeños con Salsa', description: '5 palitos de queso crujientes con salsa de guayaba.', price: 5.90, popular: false },
      ]},
      { name: 'Postres', products: [
        { name: 'Tarta de Queso Fluida', description: 'Porción de tarta de queso casera con corazón cremoso.', price: 4.90, popular: false },
      ]},
    ]
  },
  {
    slug: 'lacriolla',
    storeName: 'La Criolla',
    ownerEmail: 'admin@lacriolla.com',
    ownerPassword: 'Admin1234!',
    description: 'Empanadas argentinas artesanas, hechas con amor',
    cuisineType: 'Empanadas Argentinas',
    deliveryFee: 1.50,
    minOrder: 8.00,
    categories: [
      { name: 'Empanadas', products: [
        { name: 'Empanada de Carne Suave', description: 'Ternera picada con cebolla, pimiento y especias suaves.', price: 2.50, popular: true },
        { name: 'Empanada de Carne Picante', description: 'Ternera con ají molido, comino y un toque de picante.', price: 2.50, popular: true },
        { name: 'Empanada de Jamón y Queso', description: 'Jamón york y queso mozzarella fundido en masa crujiente.', price: 2.50, popular: false },
        { name: 'Empanada de Verduras', description: 'Espinacas, queso ricotta, champiñones y tomate seco.', price: 2.50, popular: false },
        { name: 'Empanada de Pollo', description: 'Pollo deshilachado con cebolla, pimiento rojo y aceitunas.', price: 2.50, popular: false },
      ]},
      { name: 'Bandejas', products: [
        { name: 'Bandeja 6 Empanadas', description: 'Elige 6 empanadas de cualquier sabor.', price: 13.90, popular: true },
        { name: 'Bandeja 12 Empanadas', description: 'Elige 12 empanadas de cualquier sabor. ¡Ideal para compartir!', price: 25.90, popular: true },
      ]},
      { name: 'Postres', products: [
        { name: 'Alfajor de Maicena', description: 'Galletas de maicena rellenas de dulce de leche y bañadas en coco.', price: 2.20, popular: false },
        { name: 'Dulce de Leche (Tarro)', description: 'Tarro de 250g de dulce de leche artesano argentino.', price: 5.50, popular: false },
      ]},
    ]
  },
];

async function seedStore(store) {
  console.log(`\n=== ${store.storeName} ===`);

  // Login
  const auth = await signIn(store.ownerEmail, store.ownerPassword);
  if (!auth.access_token) { console.error('  ✗ Login falhou:', auth.error_description); return; }
  const token = auth.access_token;

  // Get user + tenant (using service role to bypass RLS on tenants)
  const user = await getUser(token);
  if (!user?.id) { console.error('  ✗ User não encontrado'); return; }
  const tenantRes = await req('GET', `/rest/v1/tenants?select=id&status=eq.active&owner_id=eq.${user.id}`);
  const tenantId = tenantRes.data[0]?.id;
  if (!tenantId) { console.error('  ✗ Tenant não encontrado'); return; }
  console.log(`  Tenant: ${tenantId}`);

  // Update store info
  await req('PATCH', `/rest/v1/store_info?tenant_id=eq.${tenantId}`, {
    description: store.description,
    cuisine_type: store.cuisineType,
    delivery_fee: store.deliveryFee,
    min_order: store.minOrder,
  }, SRK);
  console.log('  ✓ Store info atualizado');

  // Get existing categories for this tenant
  const existingRes = await req('GET', `/rest/v1/categories?tenant_id=eq.${tenantId}&select=id,name`, null, SRK);
  const existing = existingRes.data || [];
  const existingMap = Object.fromEntries(existing.map(c => [c.name, c.id]));

  let pos = 1;
  for (const cat of store.categories) {
    let catId = existingMap[cat.name];
    if (!catId) {
      const r = await req('POST', '/rest/v1/categories', { name: cat.name, tenant_id: tenantId }, SRK);
      if (r.data?.code) { console.error(`  ✗ Categoria "${cat.name}":`, r.data.message); continue; }
      catId = Array.isArray(r.data) ? r.data[0]?.id : r.data?.id;
      console.log(`  ✓ Categoria "${cat.name}"`);
    } else {
      console.log(`  ↳ Categoria "${cat.name}" já existe`);
    }
    if (!catId) continue;

    // Check existing products
    const prodRes = await req('GET', `/rest/v1/products?tenant_id=eq.${tenantId}&category_id=eq.${catId}&select=name`, null, SRK);
    const existingProds = (prodRes.data || []).map(p => p.name);

    for (const product of cat.products) {
      if (existingProds.includes(product.name)) {
        console.log(`    ↳ "${product.name}" já existe`);
        continue;
      }
      const r = await req('POST', '/rest/v1/products', {
        name: product.name,
        description: product.description,
        price: product.price,
        popular: product.popular || false,
        category_id: catId,
        tenant_id: tenantId,
        position: pos++,
      }, SRK);
      if (r.data?.code) { console.error(`    ✗ "${product.name}":`, r.data.message); }
      else { console.log(`    ✓ "${product.name}" — €${product.price}`); }
    }
  }
  console.log(`  ✅ http://localhost:8081/${store.slug}`);
}

(async () => {
  await cleanupWrongCategories();
  for (const store of stores) {
    await seedStore(store);
  }
  console.log('\n=== Concluído ===');
})();
