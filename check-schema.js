import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  try {
    console.log('\n📋 Verificando estrutura das tabelas...\n');

    // Verificar categorias existentes
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    if (catError) {
      console.error('Erro ao acessar categorias:', catError.message);
    } else {
      console.log('✅ Categorias existentes:');
      if (categories && categories.length > 0) {
        console.log('Colunas:', Object.keys(categories[0]));
        console.log('Exemplo:', categories[0]);
      } else {
        console.log('Nenhuma categoria encontrada');
      }
    }

    // Verificar produtos existentes
    console.log('\n✅ Produtos existentes:');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (prodError) {
      console.error('Erro ao acessar produtos:', prodError.message);
    } else {
      if (products && products.length > 0) {
        console.log('Colunas:', Object.keys(products[0]));
        console.log('Exemplo:', products[0]);
      } else {
        console.log('Nenhum produto encontrado');
      }
    }

    // Verificar opções de variação
    console.log('\n✅ Opções de variação:');
    const { data: options, error: optError } = await supabase
      .from('option_variations')
      .select('*')
      .limit(1);

    if (optError) {
      console.error('Erro ao acessar option_variations:', optError.message);
    } else {
      if (options && options.length > 0) {
        console.log('Colunas:', Object.keys(options[0]));
        console.log('Exemplo:', options[0]);
      } else {
        console.log('Nenhuma opção de variação encontrada');
      }
    }

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkSchema();
