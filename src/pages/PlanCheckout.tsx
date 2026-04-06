import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Check, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ─── Planos ────────────────────────────────────────────────────────────────────

const PLANS = {
  auto: {
    id: 'auto',
    name: 'Auto-gestión',
    price: 10,
    desc: 'Tú llevas el control. Configura y gestiona tu tienda tú mismo.',
    features: [
      'Tienda online propia',
      'Pedidos ilimitados sin comisión',
      'Panel de administración',
      'Menú digital personalizable',
      'Soporte por email',
    ],
  },
  managed: {
    id: 'managed',
    name: 'Lo hacemos por ti',
    price: 20,
    desc: 'Nos encargamos de todo. Tú solo cocinas.',
    features: [
      'Todo del plan Auto-gestión',
      'Configuración inicial completa',
      'Diseño personalizado con tu marca',
      'Dominio propio incluido',
      'Soporte prioritario 24/7',
      'Onboarding por videollamada',
    ],
  },
};

// ─── PayPal Client ID ─────────────────────────────────────────────────────────
// Substitua pelo seu Client ID do PayPal (sandbox ou live)
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callEdge(fn: string, body: object) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlanCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planKey = (searchParams.get('plan') || 'auto') as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS.auto;

  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const createOrder = async (): Promise<string> => {
    const data = await callEdge('create-plan-order', { plan: plan.id });
    if (!data.orderId) throw new Error(data.error || 'No se pudo crear el pedido');
    return data.orderId;
  };

  // Captura server-side e redireciona para /novo
  const onApprove = async (data: { orderID: string }) => {
    setStatus('processing');
    try {
      const capture = await callEdge('capture-plan-order', { orderId: data.orderID });

      if (capture.success) {
        setStatus('success');
        setTimeout(() => navigate(`/novo?plan=${plan.id}&order=${data.orderID}`), 2000);
      } else {
        throw new Error(capture.error || 'Pago no completado');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error al procesar el pago');
    }
  };

  const onError = (err: any) => {
    setStatus('error');
    setErrorMsg(String(err?.message || err || 'Error de PayPal'));
  };

  const onCancel = () => {
    setStatus('idle');
    setErrorMsg('');
  };

  // ── Éxito ──────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">¡Pago completado!</h1>
          <p className="text-gray-500 mb-6">Redirigiendo al panel de administración...</p>
          <div className="w-8 h-8 border-4 border-[#FF3008] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture', locale: 'es_ES' }}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-gray-900">Carta</span>
              <span className="text-lg font-black text-[#FF3008]">Menu</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Pago seguro
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-start">
          {/* Plan summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-xs font-bold text-[#FF3008] uppercase tracking-widest mb-4">Tu plan</p>
            <h2 className="text-2xl font-black text-gray-900 mb-1">{plan.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-gray-900">{plan.price}€</span>
                <span className="text-gray-400 text-sm pb-1">/año</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#FF3008] font-semibold">
                <RefreshCw className="w-3.5 h-3.5" />
                Renovación automática anual
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF3008]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#FF3008]" />
                  </div>
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>

            {/* Toggle plan */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">Cambiar plan:</p>
              <div className="flex gap-2">
                {Object.values(PLANS).map((p) => (
                  <Link
                    key={p.id}
                    to={`/checkout-plan?plan=${p.id}`}
                    className={`flex-1 text-center text-xs font-bold py-2 px-3 rounded-xl border transition-all
                      ${plan.id === p.id
                        ? 'bg-[#FF3008] text-white border-[#FF3008]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                  >
                    {p.name}<br />
                    <span className="font-black">{p.price}€</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Método de pago</p>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                {errorMsg}
              </div>
            )}

            {status === 'processing' ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-10 h-10 border-4 border-[#FF3008] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Procesando tu pago...</p>
              </div>
            ) : (
              <>
                <PayPalButtons
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'pay',
                    height: 48,
                  }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                  disabled={status === 'processing'}
                />

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Pago procesado por PayPal con cifrado SSL
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <RefreshCw className="w-4 h-4 flex-shrink-0" />
                    Renovación automática cada año · Cancela cuando quieras
                  </div>
                </div>
              </>
            )}

            {/* Order summary */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Plan {plan.name}</span>
                <span className="font-semibold text-gray-900">{plan.price}€</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">IVA (21%)</span>
                <span className="font-semibold text-gray-900">{(plan.price * 0.21).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-base font-black mt-3 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="text-[#FF3008]">{(plan.price * 1.21).toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
