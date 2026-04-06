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
    const { amount, currency, tenantId, returnUrl, cancelUrl } = await req.json()

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
      return new Response(JSON.stringify({ error: 'PayPal não configurado para esta loja' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const mode = tenant.paypal_mode || 'sandbox'
    const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
    const token = await getPayPalToken(tenant.paypal_client_id, tenant.paypal_secret, mode)

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency || 'EUR',
            value: amount.toFixed(2),
          }
        }],
        ...(returnUrl ? {
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl || returnUrl,
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
          }
        } : {})
      })
    })

    const order = await res.json()
    const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href || null

    return new Response(JSON.stringify({
      orderId: order.id,
      status: order.status,
      approvalUrl,
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
