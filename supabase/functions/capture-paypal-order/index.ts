import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getPayPalToken(clientId: string, secret: string, mode: string): Promise<string> {
  const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { paypalOrderId, orderId, tenantId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: tenant } = await supabase
      .from('tenants')
      .select('paypal_client_id, paypal_secret, paypal_mode')
      .eq('id', tenantId)
      .single()

    if (!tenant?.paypal_client_id || !tenant?.paypal_secret) {
      return new Response(JSON.stringify({ error: 'PayPal não configurado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const mode = tenant.paypal_mode || 'sandbox'
    const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
    const token = await getPayPalToken(tenant.paypal_client_id, tenant.paypal_secret, mode)

    const res = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const capture = await res.json()

    if (capture.status === 'COMPLETED') {
      await supabase
        .from('orders')
        .update({ status: 'processing', payment_intent_id: paypalOrderId })
        .eq('id', orderId)
    }

    return new Response(JSON.stringify({
      success: capture.status === 'COMPLETED',
      status: capture.status,
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
