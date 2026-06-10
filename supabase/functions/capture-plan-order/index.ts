import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orderId } = await req.json()

    const clientId = Deno.env.get('PAYPAL_CLIENT_ID') || 'AW6dW2N-uZtwW9pohDKL9gpScNG-knH0eJC0q1uRulgsQgfuV858LJ7fz1TI2iCfjYTYyxsdB7VEDK6f'
    const secret = Deno.env.get('PAYPAL_CLIENT_SECRET') || 'EGIBhC4CjzvZIBWm_X6XH3ACkVAie4MdGWHkhdIrH9pYWVliyMSWahtbqbG9gw2CgDMzctL_FOc4jM9Q'
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
