import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testCreateTenant() {
  console.log('\n🔍 Testando função create-tenant...\n');
  
  try {
    console.log('📤 Enviando requisição para create-tenant...');
    console.log('URL:', SUPABASE_URL);
    console.log('Função: create-tenant\n');

    const testData = {
      storeName: 'Test Store',
      slug: 'test-store-' + Date.now(),
      ownerEmail: 'test@example.com',
      ownerPassword: 'password123',
      ownerName: 'Test User'
    };

    console.log('Payload:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabase.functions.invoke('create-tenant', {
      body: testData,
    });

    if (error) {
      console.error('\n❌ ERRO:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      if (error.context) {
        console.error('Context:', error.context);
      }
    } else {
      console.log('\n✅ SUCESSO!');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (err) {
    console.error('\n❌ ERRO NA REQUISIÇÃO:');
    console.error(err);
  }
}

testCreateTenant();
