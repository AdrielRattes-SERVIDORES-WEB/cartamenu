// upload-store-images.cjs — upload logos/banners for the 3 demo stores
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MDQzMiwiZXhwIjoyMDYyNzQ2NDMyfQ.bUvvIbSHPHR_EDwzx52z0yzA9XgUigi1IYDYVFctuV4';
const BUCKET = 'products';
const IMG_DIR = 'D:/GRAVACOES LOL/meta-folder-5';

const stores = [
  { slug: 'elreydelasador', logo: '1_Minimalist-circular-logo-for-El-Rey-del-Asador-chi.jpg', banner: '4_Wide-panoramic-website-banner-for-a-rotisserie-a-l.jpg' },
  { slug: 'bacobrasa',      logo: '2_Modern-and-bold-industrial-logo-for-Baco-Brasa-bur.jpg', banner: '5_Panoramic-commercial-banner-for-a-burger-restauran.jpg' },
  { slug: 'lacriolla',      logo: '3_Minimalist-artisanal-logo-for-La-Criolla-empanada-.jpg', banner: '6_Professional-website-banner-for-an-empanada-shop-w.jpg' },
];

async function uploadFile(localPath, storagePath) {
  const data = fs.readFileSync(localPath);
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      'apikey': SRK,
      'Authorization': `Bearer ${SRK}`,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: data,
  });
  const json = await r.json().catch(() => ({}));
  if (r.status >= 400) throw new Error(json.error || `Upload falhou: ${r.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function getTenantBySlug(slug) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id&slug=eq.${slug}`, {
    headers: { apikey: SRK, Authorization: `Bearer ${SRK}` }
  });
  const data = await r.json();
  return data[0]?.id;
}

(async () => {
  for (const store of stores) {
    console.log(`\n=== ${store.slug} ===`);

    const tenantId = await getTenantBySlug(store.slug);
    if (!tenantId) { console.error('  ✗ Tenant não encontrado'); continue; }
    console.log(`  Tenant: ${tenantId}`);

    // Upload logo
    const logoLocal = path.join(IMG_DIR, store.logo);
    const logoPath = `store-images/${store.slug}-logo.jpg`;
    let logoUrl = null;
    try {
      logoUrl = await uploadFile(logoLocal, logoPath);
      console.log(`  ✓ Logo → ${logoUrl}`);
    } catch (e) { console.error(`  ✗ Logo: ${e.message}`); }

    // Upload banner
    const bannerLocal = path.join(IMG_DIR, store.banner);
    const bannerPath = `store-images/${store.slug}-banner.jpg`;
    let bannerUrl = null;
    try {
      bannerUrl = await uploadFile(bannerLocal, bannerPath);
      console.log(`  ✓ Banner → ${bannerUrl}`);
    } catch (e) { console.error(`  ✗ Banner: ${e.message}`); }

    // Update store_info
    const updates = {};
    if (logoUrl) updates.logo = logoUrl;
    if (bannerUrl) updates.banner = bannerUrl;
    if (Object.keys(updates).length > 0) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/store_info?tenant_id=eq.${tenantId}`, {
        method: 'PATCH',
        headers: {
          apikey: SRK,
          Authorization: `Bearer ${SRK}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(updates),
      });
      if (r.status < 300) console.log(`  ✓ store_info atualizado`);
      else console.error(`  ✗ store_info update: ${r.status}`);
    }
  }
  console.log('\n=== Concluído ===');
})();
