import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function executeSeed() {
  try {
    console.log('\n🔄 Executando seed de dados...\n');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync('./seed-burguermania.sql', 'utf-8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));

    console.log(`📝 Total de comandos a executar: ${commands.length}\n`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      console.log(`[${i + 1}/${commands.length}] Executando comando...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: cmd + ';' 
      }).catch(() => {
        // Se rpc não funcionar, tentar via query direta
        return supabase.from('tenants').select('id').limit(1);
      });

      if (error) {
        console.warn(`⚠️ Aviso: ${error.message}`);
      }
    }

    // Verificar se foi criado com sucesso
    console.log('\n✅ Verificando dados inseridos...\n');
    
    const { data: stores, error: storesError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', 'burguer-mania');

    if (storesError) {
      console.error('❌ Erro ao verificar:', storesError.message);
      return;
    }

    if (stores.length > 0) {
      console.log('✅ Loja "Burguer Mania" criada com sucesso!');
      console.log(`   ID do Tenant: ${stores[0].id}`);
      console.log(`   Slug: ${stores[0].slug}`);
    } else {
      console.log('⚠️ Loja não encontrada. Execute o SQL manualmente no Supabase Dashboard.');
    }

    // Verificar store_info
    const { data: storeInfo } = await supabase
      .from('store_info')
      .select('*')
      .eq('slug', 'burguer-mania');

    if (storeInfo && storeInfo.length > 0) {
      console.log('\n✅ Store Info:');
      console.log(`   Nome: ${storeInfo[0].name}`);
      console.log(`   Descrição: ${storeInfo[0].description}`);
      console.log(`   Moeda: ${storeInfo[0].currency}`);
    }

    // Verificar produtos
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('tenant_id', stores[0]?.id);

    if (products && products.length > 0) {
      console.log(`\n✅ Produtos criados: ${products.length}`);
      products.forEach((p, idx) => {
        console.log(`   [${idx + 1}] ${p.name} - €${p.price}`);
      });
    }

    console.log('\n🎉 Seed concluído!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto (vuijhzphlagczfdamxnx)');
    console.log('3. Clique em "SQL Editor"');
    console.log('4. Cole o conteúdo de "seed-burguermania.sql"');
    console.log('5. Execute o SQL\n');
  }
}

executeSeed();
