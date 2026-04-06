// upload-images.js — Upload product images to Supabase Storage and update products
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MDQzMiwiZXhwIjoyMDYyNzQ2NDMyfQ.bUvvIbSHPHR_EDwzx52z0yzA9XgUigi1IYDYVFctuV4';
const IMAGES_DIR = 'D:/GRAVACOES LOL/meta-folder-4';
const BUCKET = 'products';

// Map image number → product name (in order of creation in fix-and-seed.js)
const imageMap = [
  { file: '1_Professional-food-photography-of-a-whole-roasted-c.jpg',  product: 'Pollo Asado Entero' },
  { file: '2_A-bowl-of-golden-roasted-potato-wedges-glistening-.jpg',   product: 'Ración de Patatas Asadas' },
  { file: '3_Close-up-of-three-golden-brown-creamy-ham-croquett.jpg',   product: 'Croquetas de Jamón' },
  { file: '4_Traditional-Spanish-Russian-salad-Ensaladilla-Rusa.jpg',   product: 'Ensaladilla Rusa' },
  { file: '5_A-table-spread-featuring-a-whole-roast-chicken-a-s.jpg',   product: 'Menú Familiar' },
  { file: '6_Gourmet-beef-burger-with-melting-cheese-fresh-lett.jpg',   product: 'Burger Clásica' },
  { file: '7_Double-smash-burger-with-extra-melting-cheddar-che.jpg',   product: 'Smash Burger Doble' },
  { file: '8_A-mountain-of-french-fries-topped-with-melted-chee.jpg',   product: 'Patatas con Bacon y Queso' },
  { file: '9_Golden-fried-cheese-sticks-tequeños-stacked-on-a-p.jpg',  product: 'Tequeños con Salsa' },
  { file: '10_A-slice-of-creamy-basque-cheesecake-soft-and-melti.jpg',  product: 'Tarta de Queso Fluida' },
  { file: '11_A-traditional-Argentine-empanada-with-a-braided-ed.jpg',  product: 'Empanada de Carne Suave' },
  { file: '12_One-baked-golden-empanada-sliced-open-to-show-the-.jpg',  product: 'Empanada de Carne Picante' },
  { file: '13_A-golden-empanada-with-some-melted-cheese-escaping.jpg',  product: 'Empanada de Jamón y Queso' },
  { file: '14_A-wooden-box-filled-with-6-different-golden-baked-.jpg',  product: 'Bandeja 6 Empanadas' },
  { file: '15_Two-Argentine-alfajores-filled-with-dulce-de-leche.jpg',  product: 'Alfajor de Maicena' },
];

async function createBucket() {
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SRK, Authorization: `Bearer ${SRK}` },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  const d = await r.json();
  if (d.error && !d.error.includes('already exists') && !d.message?.includes('already exists')) {
    console.error('Bucket error:', d);
  } else {
    console.log(`Bucket "${BUCKET}" pronto`);
  }
}

async function uploadImage(filePath, storageName) {
  const buffer = fs.readFileSync(filePath);
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storageName}`, {
    method: 'POST',
    headers: {
      apikey: SRK,
      Authorization: `Bearer ${SRK}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  return r.json();
}

async function updateProduct(productName, imageUrl) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(productName)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SRK,
      Authorization: `Bearer ${SRK}`,
    },
    body: JSON.stringify({ image_url: imageUrl }),
  });
  return r.status;
}

(async () => {
  await createBucket();
  console.log('');

  for (const item of imageMap) {
    const filePath = path.join(IMAGES_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ Arquivo não encontrado: ${item.file}`);
      continue;
    }

    const storageName = `products/${item.file}`;
    const upload = await uploadImage(filePath, storageName);
    if (upload.error) {
      console.error(`  ✗ Upload "${item.file}": ${upload.error}`);
      continue;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storageName}`;
    const status = await updateProduct(item.product, publicUrl);
    console.log(`  ${status === 204 ? '✓' : '✗'} "${item.product}" → ${status}`);
  }

  console.log('\n✅ Concluído');
})();
