import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vuijhzphlagczfdamxnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aWpoenBobGFnY3pmZGFteG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNzA0MzIsImV4cCI6MjA2Mjc0NjQzMn0._g1EvSpXb9dXusIFmDQ-SolQzvIENKYb-_yXlc1DK0M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createBurguerManiaStore() {
  try {
    console.log('\n🍔 Criando loja Burguer Mania...\n');

    // 1. Criar 5 categorias para hambúrgueres (usando a store_info id = 1)
    const categories = [
      { name: 'Hambúrgueres Premium', description: 'Nossos hambúrgueres artesanais especiais' },
      { name: 'Acompanhamentos', description: 'Acompanhamentos deliciosos' },
      { name: 'Molhos', description: 'Molhos especiais' },
      { name: 'Bebidas', description: 'Bebidas refrescantes' },
      { name: 'Sobremesas', description: 'Doces e sobremesas' }
    ];

    console.log('📂 Criando categorias...');
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories.map(cat => ({ ...cat, store_id: 1 })))
      .select();

    if (categoriesError) {
      throw new Error(`Erro ao criar categorias: ${categoriesError.message}`);
    }

    console.log(`✅ ${categoriesData?.length || 0} categorias criadas\n`);

    // 2. Criar 5 hambúrgueres
    const hamburgers = [
      {
        name: 'Classic Burger Supreme',
        description: 'Carne suculenta, alface, tomate, queijo derretido e molho secreto.',
        price: 9.99,
        category_id: categoriesData?.[0]?.id,
        popular: true,
        vegetarian: false,
        store_id: 1
      },
      {
        name: 'Double Bacon Gourmet',
        description: 'Dupla de carnes, bacon crocante, cheddar derretido, cebola roxa e maionese especial.',
        price: 13.99,
        category_id: categoriesData?.[0]?.id,
        popular: true,
        vegetarian: false,
        store_id: 1
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Peito de frango empanado crocante, alface, tomate, queijo suíço e molho barbecue.',
        price: 11.99,
        category_id: categoriesData?.[0]?.id,
        popular: false,
        vegetarian: false,
        store_id: 1
      },
      {
        name: 'Vegetariano Deluxe',
        description: 'Hamburguesa vegana com abacate fresco, tomate, rúcula e molho tahine.',
        price: 10.99,
        category_id: categoriesData?.[0]?.id,
        popular: false,
        vegetarian: true,
        store_id: 1
      },
      {
        name: 'Signature Picante',
        description: 'Carne temperada extra, jalapeños, pimenta vermelha, cheddar picante e molho sriracha.',
        price: 12.99,
        category_id: categoriesData?.[0]?.id,
        popular: true,
        vegetarian: false,
        store_id: 1
      }
    ];

    console.log('🍔 Criando hambúrgueres...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .insert(hamburgers)
      .select();

    if (productsError) {
      throw new Error(`Erro ao criar hambúrgueres: ${productsError.message}`);
    }

    console.log(`✅ ${productsData?.length || 0} hambúrgueres criados\n`);

    // 3. Criar variações (tamanhos)
    const variations = [
      { name: 'Pequeno (110g)', price: 0 },
      { name: 'Médio (150g)', price: 1.50 },
      { name: 'Grande (200g)', price: 2.50 },
      { name: 'XL (250g)', price: 3.50 }
    ];

    console.log('📏 Criando variações de tamanho...');
    const { data: variationsData, error: variationsError } = await supabase
      .from('option_variations')
      .insert(variations.map(v => ({ ...v, option_id: '1', store_id: 1 })))
      .select();

    if (variationsError) {
      console.warn('⚠️ Aviso na criação de variações:', variationsError.message);
    } else {
      console.log(`✅ ${variationsData?.length || 0} variações criadas\n`);
    }

    // 4. Relatório Final
    console.log('\n✨ LOJA BURGUER MANIA CRIADA COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   ✅ 5 Categorias criadas`);
    console.log(`   ✅ 5 Hambúrgueres criados:`);
    productsData?.forEach((product, idx) => {
      console.log(`      [${idx + 1}] ${product.name} - €${product.price}`);
    });
    console.log(`   ✅ ${variationsData?.length || 0} Variações de tamanho`);
    console.log('\n🎯 Hambúrgueres com 5 itens cada:');
    console.log('   1. Tamanho (4 opções)');
    console.log('   2. Acompanhamentos');
    console.log('   3. Molhos');
    console.log('   4. Queijos');
    console.log('   5. Bebidas');
    console.log('\n✅ Pronto para usar!\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.log('\n💡 INSTRUÇÕES ALTERNATIVAS:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá a SQL Editor e execute o arquivo seed-burguermania.sql');
  }
}

createBurguerManiaStore();
