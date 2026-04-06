import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { domain, tenantId } = await req.json()

    if (!domain || !tenantId) {
      return new Response(JSON.stringify({ error: 'domain e tenantId são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const VERCEL_TOKEN = Deno.env.get('VERCEL_API_TOKEN')
    const VERCEL_PROJECT_ID = Deno.env.get('VERCEL_PROJECT_ID')

    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
      return new Response(JSON.stringify({ error: 'Vercel não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Adicionar domínio no Vercel
    const vercelRes = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    const vercelData = await vercelRes.json()

    if (!vercelRes.ok) {
      return new Response(JSON.stringify({ error: vercelData.error?.message || 'Erro no Vercel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Salvar no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase
      .from('tenants')
      .update({ custom_domain: domain })
      .eq('id', tenantId)

    return new Response(JSON.stringify({
      success: true,
      domain,
      verification: vercelData.verification || [],
      cname: 'cname.vercel-dns.com',
      instructions: `Adicione um CNAME no seu DNS: ${domain} → cname.vercel-dns.com`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
