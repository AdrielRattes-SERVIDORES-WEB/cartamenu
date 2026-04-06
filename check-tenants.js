const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SRK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzE3MDQzMiwiZXhwIjoyMDYyNzQ2NDMyfQ.bUvvIbSHPHR_EDwzx52z0yzA9XgUigi1IYDYVFctuV4';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

(async () => {
  // Get all tenants with owner_id
  const r = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id,slug,owner_id,status`, {
    headers: { apikey: SRK, Authorization: `Bearer ${SRK}` }
  });
  const tenants = await r.json();
  console.log('Tenants:', JSON.stringify(tenants, null, 2));

  // Try login and get user id for one store
  const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON },
    body: JSON.stringify({ email: 'admin@elreydelasador.com', password: 'Admin1234!' })
  });
  const login = await loginRes.json();
  if (login.access_token) {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON, Authorization: `Bearer ${login.access_token}` }
    });
    const user = await userRes.json();
    console.log('\nUser ID for elreydelasador:', user.id);
    console.log('Matching tenant:', tenants.find(t => t.owner_id === user.id));
  } else {
    console.log('Login failed:', login);
  }
})();
