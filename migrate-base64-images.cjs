// migrate-base64-images.cjs — converte base64 do banco para Supabase Storage
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MDQzMiwiZXhwIjoyMDYyNzQ2NDMyfQ.bUvvIbSHPHR_EDwzx52z0yzA9XgUigi1IYDYVFctuV4';
const BASE = 'https://vuijhzphlagczfdamxnx.supabase.co';
const BUCKET = 'products';

async function uploadBase64(base64DataUrl, path) {
  // base64DataUrl = "data:image/png;base64,XXXXX"
  const [header, data] = base64DataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const buf = Buffer.from(data, 'base64');
  const r = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SRK,
      Authorization: `Bearer ${SRK}`,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: buf,
  });
  const json = await r.json().catch(() => ({}));
  if (r.status >= 400) throw new Error(json.error || `Upload falhou ${r.status}`);
  return `${BASE}/storage/v1/object/public/${BUCKET}/${path}`;
}

(async () => {
  // Busca todas as lojas com base64
  const r = await fetch(`${BASE}/rest/v1/store_info?select=id,name,logo,banner`, {
    headers: { apikey: SRK, Authorization: `Bearer ${SRK}` }
  });
  const stores = await r.json();
  const withBase64 = stores.filter(s =>
    (s.logo && s.logo.startsWith('data:')) || (s.banner && s.banner.startsWith('data:'))
  );

  console.log(`${withBase64.length} loja(s) com base64 para migrar`);

  for (const store of withBase64) {
    console.log(`\n→ ${store.name} (id=${store.id})`);
    const updates = {};

    if (store.logo && store.logo.startsWith('data:')) {
      console.log(`  Uploading logo (${Math.round(store.logo.length/1024)}KB base64)...`);
      const url = await uploadBase64(store.logo, `store-images/store-${store.id}-logo.jpg`).catch(e => { console.error('  ✗ logo:', e.message); return null; });
      if (url) { updates.logo = url; console.log(`  ✓ logo → ${url}`); }
    }

    if (store.banner && store.banner.startsWith('data:')) {
      console.log(`  Uploading banner (${Math.round(store.banner.length/1024)}KB base64)...`);
      const url = await uploadBase64(store.banner, `store-images/store-${store.id}-banner.jpg`).catch(e => { console.error('  ✗ banner:', e.message); return null; });
      if (url) { updates.banner = url; console.log(`  ✓ banner → ${url}`); }
    }

    if (Object.keys(updates).length > 0) {
      const p = await fetch(`${BASE}/rest/v1/store_info?id=eq.${store.id}`, {
        method: 'PATCH',
        headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(updates),
      });
      console.log(`  ${p.status < 300 ? '✓' : '✗'} store_info atualizado (${p.status})`);
    }
  }
  console.log('\n=== Concluído ===');
})();
