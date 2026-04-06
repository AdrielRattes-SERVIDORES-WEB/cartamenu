import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Check, ArrowRight, Store, User, Mail, Lock, Globe, Loader2 } from 'lucide-react';

export default function NewStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planParam = searchParams.get('plan') || 'auto';
  const orderParam = searchParams.get('order') || '';

  const planLabel = planParam === 'managed' ? 'Lo hacemos por ti' : 'Auto-gestión';

  const [form, setForm] = useState({
    storeName: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });

  const handleSlugChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setForm(f => ({ ...f, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-tenant', {
        body: {
          storeName: form.storeName,
          slug: form.slug,
          ownerName: form.ownerName,
          ownerEmail: form.ownerEmail,
          ownerPassword: form.ownerPassword,
          plan: planParam,
          paypalOrderId: orderParam || undefined,
        },
      });

      if (fnError) throw fnError;

      // Fazer login automático com as credenciais criadas
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.ownerEmail,
        password: form.ownerPassword,
      });
      if (signInError) throw signInError;

      navigate('/admin');
    } catch (err: any) {
      setError(err?.message || 'Error al crear la tienda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fraunces: React.CSSProperties = {
    fontFamily: "'Fraunces', Georgia, serif",
    fontVariationSettings: "'opsz' 36, 'SOFT' 40",
  };

  return (
    <div className="min-h-screen bg-[#0E1119] flex flex-col">
      {/* Header */}
      <nav className="border-b border-white/5 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Carta</span>
            <span className="text-xl font-black text-[#FF3008]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Menu</span>
          </Link>
          {orderParam && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Check className="w-3.5 h-3.5" />
              Pago confirmado
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-start">

          {/* Left — info */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/8 text-white/60 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-white/10">
              <span className="w-1.5 h-1.5 bg-[#FF3008] rounded-full" />
              Plan: {planLabel}
            </div>

            <h1 className="text-4xl sm:text-5xl text-white leading-tight mb-5" style={{ ...fraunces, fontWeight: 700 }}>
              Crea tu tienda<br />
              <span className="text-[#FF3008]">en minutos</span>
            </h1>

            <p className="text-white/50 text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Configura los datos básicos de tu restaurante. Podrás personalizar tu menú, fotos y opciones desde el panel de administración.
            </p>

            <ul className="space-y-4">
              {[
                'Tu propio link de pedidos',
                'Panel de administración completo',
                'Sin comisiones por pedido',
                'Clientes directos, sin intermediarios',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF3008]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#FF3008]" />
                  </div>
                  <span className="text-white/70 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="bg-[#161926] border border-white/10 rounded-3xl p-8">
            <h2 className="text-white text-xl font-bold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Datos de tu restaurante
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Store name */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Nombre del restaurante
                </label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={form.storeName}
                    onChange={e => {
                      setForm(f => ({ ...f, storeName: e.target.value }));
                      if (!form.slug) handleSlugChange(e.target.value);
                    }}
                    placeholder="Pizza Napoli"
                    required
                    className="w-full bg-[#1e2235] border border-white/10 text-white placeholder-white/25 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3008]/50 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  URL de tu tienda
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <div className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    cartamenu.shop/
                  </div>
                  <input
                    value={form.slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="pizzanapoli"
                    required
                    className="w-full bg-[#1e2235] border border-white/10 text-white placeholder-white/25 rounded-xl pl-[11.5rem] pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3008]/50 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
                {form.slug && (
                  <p className="text-xs text-white/30 mt-1.5 ml-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    cartamenu.shop/<span className="text-[#FF3008]">{form.slug}</span>
                  </p>
                )}
              </div>

              {/* Owner name */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Tu nombre
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={form.ownerName}
                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                    placeholder="Carlos García"
                    className="w-full bg-[#1e2235] border border-white/10 text-white placeholder-white/25 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3008]/50 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Email de acceso
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={form.ownerEmail}
                    onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
                    placeholder="carlos@pizzanapoli.es"
                    required
                    className="w-full bg-[#1e2235] border border-white/10 text-white placeholder-white/25 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3008]/50 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={form.ownerPassword}
                    onChange={e => setForm(f => ({ ...f, ownerPassword: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full bg-[#1e2235] border border-white/10 text-white placeholder-white/25 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#FF3008]/50 transition-all"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF3008] hover:bg-[#d42a07] disabled:opacity-60 text-white font-bold py-4 rounded-full text-sm transition-all hover:shadow-xl hover:shadow-[#FF3008]/25 flex items-center justify-center gap-2 mt-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando tu tienda...
                  </>
                ) : (
                  <>
                    Crear mi tienda
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
