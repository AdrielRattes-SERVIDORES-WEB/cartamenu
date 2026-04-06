import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS: Record<string, { name: string; price: number }> = {
  auto: { name: 'Auto-gestión', price: 10 },
  managed: { name: 'Lo hacemos por ti', price: 20 },
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
  if (!data.access_token) {
    throw new Error(`PayPal token error: ${JSON.stringify(data)}`)
  }
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { plan } = await req.json()

    const planData = PLANS[plan] ?? PLANS.auto
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const secret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const mode = Deno.env.get('PAYPAL_MODE') || 'sandbox'

    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: 'PayPal credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
    const token = await getPayPalToken(clientId, secret, mode)
    const currency = mode === 'live' ? 'EUR' : 'USD'

    const res = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: `CartaMenu - Plan ${planData.name}`,
          amount: {
            currency_code: currency,
            value: planData.price.toFixed(2),
          },
        }],
      }),
    })

    const order = await res.json()

    if (!order.id) {
      return new Response(JSON.stringify({ error: `PayPal order error: ${JSON.stringify(order)}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ orderId: order.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
