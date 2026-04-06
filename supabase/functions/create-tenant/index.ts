import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { slug, storeName, ownerEmail, ownerPassword, ownerName, plan, paypalOrderId } = await req.json()

    if (!slug || !storeName || !ownerEmail || !ownerPassword) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: slug, storeName, ownerEmail, ownerPassword' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verificar se slug já existe
    const { data: existing } = await supabase.from('tenants').select('id').eq('slug', slug).single()
    if (existing) {
      return new Response(JSON.stringify({ error: 'Slug já em uso' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Criar usuário admin
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: { name: ownerName }
    })

    if (authError) throw authError

    // Criar tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ slug, status: 'active', plan: plan || 'auto', owner_id: authUser.user.id })
      .select()
      .single()

    if (tenantError) throw tenantError

    // Criar store_info
    await supabase.from('store_info').insert({
      name: storeName,
      tenant_id: tenant.id,
      slug,
      delivery_fee: 0,
      min_order: 0,
      currency: 'EUR',
      enable_delivery: true,
      enable_pickup: true,
    })

    // Criar perfil
    await supabase.from('profiles').insert({
      id: authUser.user.id,
      email: ownerEmail,
      name: ownerName || ownerEmail.split('@')[0],
    })

    // Atribuir role admin
    await supabase.from('user_roles').insert({
      user_id: authUser.user.id,
      role: 'admin',
      tenant_id: tenant.id,
    })

    // Enviar email de boas-vindas (não bloqueia o fluxo)
    supabase.functions.invoke('send-email', {
      body: {
        type: 'new_store',
        data: { ownerName: ownerName || ownerEmail.split('@')[0], ownerEmail, storeName, slug }
      }
    }).catch(() => {});

    return new Response(JSON.stringify({
      success: true,
      tenant,
      url: `https://cartamenu.vercel.app/${slug}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
