import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    const { data, error } = await supabase
      .from('store_info')
      .select('id, name');
    
    if (error) {
      console.error('❌ Erro:', error.message);
    } else {
      console.log('\n📊 RESULTADO:\n');
      console.log(`Total de lojas cadastradas: ${data.length}\n`);
      if (data.length > 0) {
        console.log('Detalhes:');
        data.forEach((store, idx) => {
          console.log(`  [${idx + 1}] ID: ${store.id}, Nome: ${store.name}`);
        });
      }
      console.log('\n');
    }
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
  }
})();
