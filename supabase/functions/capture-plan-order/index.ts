import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderId } = await req.json()

    const clientId = Deno.env.get('PAYPAL_CLIENT_ID') || 'AUx81m1NqUoRAa06d3xZEpUP2-radBBaQVeD2QMsufLpxhvuweY10xyOWLx_Rsrw7OW1IkDARGwGlomn'
    const secret = Deno.env.get('PAYPAL_CLIENT_SECRET') || 'EEz1xj11I_9iaQ9mjmokTvyWzhn8qKgS7Eswfyh5D6-8UQW_1ekFFzfhELe0LwBxzceKyClpWAGwZnpJ'
    const mode = Deno.env.get('PAYPAL_MODE') || 'live'
    const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

    // Get token
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${secret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    const { access_token } = await tokenRes.json()

    // Capture
    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })
    const capture = await captureRes.json()

    return new Response(JSON.stringify({
      success: capture.status === 'COMPLETED',
      status: capture.status,
      id: capture.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
