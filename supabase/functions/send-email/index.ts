import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

async function sendViaResend(payload: EmailPayload): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from || 'CartaMenu <noreply@cartamenu.shop>',
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  return res.ok;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, data } = await req.json();

    let emailPayload: EmailPayload | null = null;

    if (type === 'order_confirmation') {
      const { customerName, customerEmail, orderId, total, items, storeName } = data;
      emailPayload = {
        to: customerEmail,
        subject: `Pedido confirmado - ${storeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${storeName}</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2>Olá, ${customerName}! 🎉</h2>
              <p>Seu pedido foi confirmado com sucesso!</p>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p><strong>Pedido:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
                <p><strong>Total:</strong> €${Number(total).toFixed(2)}</p>
                ${items?.map((item: any) => `
                  <div style="border-bottom: 1px solid #eee; padding: 8px 0;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span style="float: right;">€${Number(item.total_price || item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('') || ''}
              </div>
              <p style="color: #666; font-size: 14px;">Acompanhe seu pedido na plataforma. Em breve entraremos em contato!</p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              Powered by <strong>CartaMenu</strong>
            </div>
          </div>
        `,
      };
    } else if (type === 'new_store') {
      const { ownerName, ownerEmail, storeName, slug } = data;
      emailPayload = {
        to: ownerEmail,
        subject: `Bem-vindo ao CartaMenu! Sua loja ${storeName} está pronta`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">CartaMenu</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2>Olá, ${ownerName}! 🚀</h2>
              <p>Sua loja <strong>${storeName}</strong> foi criada com sucesso!</p>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p><strong>URL da sua loja:</strong></p>
                <a href="https://cartamenu.vercel.app/${slug}" style="color: #f97316; font-size: 18px;">
                  cartamenu.vercel.app/${slug}
                </a>
              </div>
              <p>Acesse o painel de administração para configurar:</p>
              <ul>
                <li>Logo e banner da loja</li>
                <li>Produtos e categorias</li>
                <li>Configurações de entrega</li>
                <li>Pagamentos (Stripe e PayPal)</li>
                <li>Domínio personalizado</li>
              </ul>
              <a href="https://cartamenu.vercel.app/${slug}/admin"
                 style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 10px;">
                Acessar Painel Admin
              </a>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              Powered by <strong>CartaMenu</strong>
            </div>
          </div>
        `,
      };
    } else if (type === 'order_status_update') {
      const { customerName, customerEmail, orderId, status, storeName } = data;
      const statusLabels: Record<string, string> = {
        processing: 'Em preparo 👨‍🍳',
        delivering: 'Saiu para entrega 🛵',
        delivered: 'Entregue ✅',
        cancelled: 'Cancelado ❌',
      };
      emailPayload = {
        to: customerEmail,
        subject: `Atualização do seu pedido - ${storeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f97316; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${storeName}</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2>Olá, ${customerName}!</h2>
              <p>Seu pedido <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> foi atualizado:</p>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #f97316; font-size: 24px; margin: 0;">
                  ${statusLabels[status] || status}
                </h3>
              </div>
            </div>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              Powered by <strong>CartaMenu</strong>
            </div>
          </div>
        `,
      };
    }

    if (!emailPayload) {
      return new Response(JSON.stringify({ error: 'Tipo de email desconhecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const sent = await sendViaResend(emailPayload);

    return new Response(JSON.stringify({ success: sent, message: sent ? 'Email enviado' : 'RESEND_API_KEY não configurada' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
