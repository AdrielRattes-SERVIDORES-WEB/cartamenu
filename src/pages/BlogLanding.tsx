import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, ChevronRight } from "lucide-react";
import { BLOG_POSTS as REAL_POSTS } from "@/data/blogPosts";
import SEOHead from "@/components/SEOHead";
import BlogFooter from "@/components/BlogFooter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "+200", label: "Restaurantes activos" },
  { value: "30%", label: "Comisión que ahorras" },
  { value: "5 min", label: "Para empezar" },
  { value: "4.9★", label: "Valoración media" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crea tu tienda",
    desc: "Configura tu menú, precios y horarios en minutos desde nuestro panel de administración.",
  },
  {
    step: "02",
    title: "Comparte tu link",
    desc: "Envía tu enlace a tus clientes por WhatsApp, Instagram o ponlo en tu local.",
  },
  {
    step: "03",
    title: "Recibe pedidos",
    desc: "Gestiona todo desde el panel. Sin comisiones, el dinero es tuyo.",
  },
];

const PRICING = [
  {
    name: "Auto-gestión",
    price: "10",
    badge: null,
    desc: "Para restaurantes que quieren gestionar su propio canal de venta.",
    features: [
      "Tienda online propia",
      "Pedidos ilimitados sin comisión",
      "Panel de administración",
      "Menú digital personalizable",
      "Soporte por email",
    ],
    cta: "Empezar ahora",
    highlight: false,
  },
  {
    name: "Lo hacemos por ti",
    price: "20",
    badge: "Más popular",
    desc: "Nos encargamos de todo. Tú solo cocinas y recibe los pedidos.",
    features: [
      "Todo del plan Auto-gestión",
      "Configuración inicial completa",
      "Diseño personalizado con tu marca",
      "Dominio propio incluido",
      "Soporte prioritario 24/7",
      "Onboarding por videollamada",
      "Gestión de contenido del blog",
    ],
    cta: "Lo quiero todo",
    highlight: true,
  },
];

const BLOG_POSTS = [
  {
    tag: "Digitalización",
    emoji: "📱",
    title: "Cómo digitalizar tu restaurante en 2025: guía paso a paso",
    excerpt: "Descubre los pasos esenciales para llevar tu restaurante al mundo digital y empezar a recibir pedidos online hoy mismo.",
    readTime: "5 min",
    gradient: "from-orange-50 to-amber-100",
  },
  {
    tag: "Ventas",
    emoji: "📈",
    title: "Cómo aumentar tus ventas en Madrid y Barcelona con delivery propio",
    excerpt: "Las ciudades más competitivas de España esconden oportunidades que los restaurantes aún no están aprovechando.",
    readTime: "7 min",
    gradient: "from-rose-50 to-pink-100",
  },
  {
    tag: "Ahorro",
    emoji: "💰",
    title: "Por qué pagar menos por tu propio canal de delivery vale más",
    excerpt: "Analizamos cuánto pierdes con las grandes plataformas y cómo recuperar ese margen con una solución propia.",
    readTime: "6 min",
    gradient: "from-emerald-50 to-teal-100",
  },
];

// Fraunces font-variation shorthands
const fraunces: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontVariationSettings: "'opsz' 36, 'SOFT' 40, 'WONK' 0",
};

const frauncesDisplay: React.CSSProperties = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontVariationSettings: "'opsz' 72, 'SOFT' 50, 'WONK' 0",
};

const jakartaSans: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#12151E]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0.5">
          <span className="text-xl font-black text-white tracking-tight" style={jakartaSans}>Carta</span>
          <span className="text-xl font-black text-[#FF3008] tracking-tight" style={jakartaSans}>Menu</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60" style={jakartaSans}>
          <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
          <a href="#demos" className="hover:text-white transition-colors">Demos</a>
          <a href="#planes" className="hover:text-white transition-colors">Precios</a>
          <a href="#blog" className="hover:text-white transition-colors">Blog</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin-login" className="hidden sm:block text-sm font-semibold text-white/60 hover:text-white transition-colors" style={jakartaSans}>
            Iniciar sesión
          </Link>
          <a
            href="#planes"
            className="bg-[#FF3008] hover:bg-[#d42a07] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-[#FF3008]/25"
            style={jakartaSans}
          >
            Empieza por 10€/año
          </a>
        </div>
      </div>
    </nav>
  );
}

const TYPING_PHRASES = [
  "Más pedidos. Sin comisiones.",
  "La plataforma que te libera de Glovo.",
  "Tu restaurante. Tu canal. Tus clientes.",
  "Sin Uber Eats. Sin Just Eat. Sin ataduras.",
  "Desde 10€/año. Sin sorpresas.",
];

function useTypingEffect(phrases: string[], speed = 60, pause = 1800) {
  const [displayed, setDisplayed] = React.useState("");
  const [phraseIdx, setPhraseIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, phraseIdx, phrases, speed, pause]);

  return displayed;
}

function Hero() {
  const typedText = useTypingEffect(TYPING_PHRASES);

  return (
    <section className="pt-16 bg-[#0E1119] min-h-[80vh] flex items-center relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-[#FF3008]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 grid lg:grid-cols-[1fr_auto] gap-16 items-center">
        {/* Left */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/8 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full mb-10 border border-white/10" style={jakartaSans}>
            <span className="w-1.5 h-1.5 bg-[#FF3008] rounded-full animate-pulse" />
            Para restaurantes en España
          </div>

          <h1
            className="text-[clamp(3rem,8vw,5.5rem)] text-white leading-[1.02] tracking-tight mb-6"
            style={{ ...frauncesDisplay, fontWeight: 800 }}
          >
            Más pedidos.<br />
            <span className="text-[#FF3008]">Sin comisiones.</span>
          </h1>

          {/* Typing animation */}
          <div className="mb-10 max-w-lg min-h-[3.5rem] flex items-center" style={jakartaSans}>
            <p className="text-lg sm:text-xl text-white/60 leading-relaxed">
              {typedText}
              <span className="inline-block w-[2px] h-[1.1em] bg-[#FF3008] ml-0.5 align-middle animate-pulse" />
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/checkout-plan?plan=auto"
            className="inline-flex items-center gap-2 bg-[#FF3008] hover:bg-[#d42a07] text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-[#FF3008]/30 text-sm"
            style={jakartaSans}
          >
            Empezar por 10€/año
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs text-white/30 mt-3" style={jakartaSans}>Pago único anual · Sin comisiones por pedido · Soporte en español</p>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["🧑‍🍳", "👩‍🍳", "🧑‍🍳", "👨‍🍳"].map((e, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/10 border-2 border-[#0E1119] flex items-center justify-center text-base">
                  {e}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-3.5 h-3.5 fill-[#FF3008]" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-0.5" style={jakartaSans}>
                <strong className="text-white/80">+200 restaurantes</strong> ya confían en nosotros
              </p>
            </div>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="hidden lg:flex justify-end">
          <div className="relative w-72">
            <div
              className="bg-[#1A1D28] rounded-[2.5rem] overflow-hidden border border-white/10"
              style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}
            >
              {/* Status bar */}
              <div className="bg-[#0E1119] px-6 py-3.5 flex justify-between items-center">
                <span className="text-white/70 text-xs font-semibold" style={jakartaSans}>9:41</span>
                <div className="flex gap-1.5">
                  <div className="w-4 h-2 bg-white/20 rounded-sm" />
                  <div className="w-3 h-2 bg-white/20 rounded-sm" />
                  <div className="w-4 h-2 bg-white/60 rounded-sm" />
                </div>
              </div>
              {/* App header */}
              <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #c02200, #FF3008)' }}>
                <p className="text-white/70 text-xs font-medium" style={jakartaSans}>Restaurante</p>
                <p className="text-white font-black text-xl" style={jakartaSans}>CartaMenu</p>
              </div>
              {/* Order card */}
              <div className="p-4 space-y-3 bg-[#1A1D28]">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-widest" style={jakartaSans}>Nuevo pedido</p>
                {[
                  { name: "Pizza Margherita", qty: 2, price: "18,00€" },
                  { name: "Agua 500ml", qty: 1, price: "2,00€" },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-1">
                    <div>
                      <p className="text-sm font-semibold text-white/90" style={jakartaSans}>{item.name}</p>
                      <p className="text-xs text-white/30" style={jakartaSans}>x{item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-white/80" style={jakartaSans}>{item.price}</p>
                  </div>
                ))}
                <div className="border-t border-white/8 pt-3 flex justify-between">
                  <p className="text-sm font-black text-white/90" style={jakartaSans}>Total</p>
                  <p className="text-sm font-black text-[#FF3008]" style={jakartaSans}>20,00€</p>
                </div>
                <button
                  className="w-full text-white font-bold py-3 rounded-2xl text-sm"
                  style={{ background: 'linear-gradient(135deg, #c02200, #FF3008)', ...jakartaSans }}
                >
                  Confirmar pedido
                </button>
              </div>
            </div>
            {/* Floating badge — top right */}
            <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-2xl px-4 py-3">
              <p className="text-2xl font-black text-gray-900" style={fraunces}>+34%</p>
              <p className="text-xs text-gray-500" style={jakartaSans}>más ingresos</p>
            </div>
            {/* Floating badge — bottom left */}
            <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900" style={jakartaSans}>Sin comisión</p>
                <p className="text-xs text-gray-400" style={jakartaSans}>100% tuyo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="bg-[#FF3008]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-white" style={fraunces}>{s.value}</p>
              <p className="text-sm text-white/70 mt-1 font-medium" style={jakartaSans}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-20">
          <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4" style={jakartaSans}>Proceso</p>
          <h2 className="text-4xl sm:text-5xl text-gray-900 leading-tight" style={{ ...fraunces, fontWeight: 700 }}>
            Empieza a vender<br />en menos de una hora
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="relative">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-[#FF3008]/12 select-none leading-none" style={fraunces}>
                  {step.step}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3" style={fraunces}>{step.title}</h3>
              <p className="text-gray-500 leading-relaxed text-[15px]" style={jakartaSans}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SUPABASE_IMG = 'https://vuijhzphlagczfdamxnx.supabase.co/storage/v1/object/public/products/store-images';

const DEMO_STORES = [
  {
    slug: 'elreydelasador',
    name: 'El Rey del Asador',
    category: 'Asador · Carnes a la brasa',
    desc: 'Pollos y costillares al horno de leña. La carta digital que sirve pedidos sin parar.',
    logo: `${SUPABASE_IMG}/elreydelasador-logo.jpg`,
    banner: `${SUPABASE_IMG}/elreydelasador-demo.jpg`,
    accent: '#D97706',
    labelColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    slug: 'bacobrasa',
    name: 'Baco Brasa',
    category: 'Hamburguesas · Street food',
    desc: 'Burgers artesanales con ingredientes premium. Sin Glovo, sin comisión, 100% tuyo.',
    logo: `${SUPABASE_IMG}/bacobrasa-logo.jpg`,
    banner: `${SUPABASE_IMG}/bacobrasa-demo.jpg`,
    accent: '#FF3008',
    labelColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  {
    slug: 'lacriolla',
    name: 'La Criolla',
    category: 'Empanadas · Cocina latina',
    desc: 'Empanadas de autor con ingredientes frescos. Pedidos directos desde el móvil.',
    logo: `${SUPABASE_IMG}/lacriolla-logo.jpg`,
    banner: `${SUPABASE_IMG}/lacriolla-demo.jpg`,
    accent: '#16A34A',
    labelColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
];

function DemoStores() {
  return (
    <section id="demos" className="py-28 bg-[#0E1119] relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Ambient glow */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3008]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-white/50 text-xs font-bold px-3 py-1.5 rounded-full mb-5" style={jakartaSans}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3008] animate-pulse" />
              TIENDAS DEMO
            </div>
            <h2
              className="text-4xl sm:text-5xl text-white leading-[1.08]"
              style={{ ...fraunces, fontWeight: 700 }}
            >
              Así luce tu restaurante<br />
              <span className="text-[#FF3008]">con CartaMenu</span>
            </h2>
          </div>
          <p className="text-white/40 text-base max-w-xs leading-relaxed md:text-right" style={jakartaSans}>
            Haz clic en cualquier tienda para verla en vivo tal como la ven tus clientes.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {DEMO_STORES.map((store, i) => (
            <Link
              key={store.slug}
              to={`/${store.slug}`}
              className="group relative rounded-3xl overflow-hidden flex flex-col cursor-pointer"
              style={{
                background: '#161926',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${store.accent}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
              }}
            >
              {/* Banner */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={store.banner}
                  alt={`Banner ${store.name}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* gradient overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(22,25,38,0.85) 100%)' }} />

                {/* Category pill top-right */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${store.labelColor}`}
                    style={jakartaSans}
                  >
                    {store.category}
                  </span>
                </div>

                {/* "Ver tienda" hover pill */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className="text-white text-sm font-bold px-5 py-2.5 rounded-full backdrop-blur-sm flex items-center gap-2"
                    style={{ background: store.accent, ...jakartaSans, boxShadow: `0 4px 20px ${store.accent}66` }}
                  >
                    Ver tienda en vivo
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Logo — outside banner so overflow-hidden doesn't clip it */}
              <div className="px-5 -mt-8 relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 shadow-xl"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', background: '#161926', boxShadow: `0 8px 24px ${store.accent}33` }}
                >
                  <img
                    src={store.logo}
                    alt={`Logo ${store.name}`}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="pt-3 px-5 pb-6 flex flex-col flex-1">
                <h3
                  className="text-white text-xl font-bold mb-2 leading-tight group-hover:text-white transition-colors"
                  style={fraunces}
                >
                  {store.name}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1" style={jakartaSans}>
                  {store.desc}
                </p>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/30 font-medium" style={jakartaSans}>Tienda activa</span>
                  </div>
                  <span
                    className="text-xs font-bold flex items-center gap-1 transition-all"
                    style={{ color: store.accent, ...jakartaSans }}
                  >
                    Ver tienda
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/20 text-sm mt-10" style={jakartaSans}>
          Estas son tiendas de demostración reales · Tu tienda se verá exactamente igual
        </p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="planes" className="py-28 bg-[#F7F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4" style={jakartaSans}>Precios</p>
          <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4" style={{ ...fraunces, fontWeight: 700 }}>
            Simples. Sin letra pequeña.
          </h2>
          <p className="text-gray-500 text-lg" style={jakartaSans}>Una cuota fija. Sin comisiones por pedido. Sin sorpresas.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-9 flex flex-col transition-all duration-300 hover:-translate-y-1
                ${plan.highlight
                  ? "bg-[#0E1119] text-white"
                  : "bg-white border border-stone-200/60 shadow-sm hover:shadow-xl hover:shadow-stone-200/60"
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-7 bg-[#FF3008] text-white text-xs font-bold px-3 py-1.5 rounded-full" style={jakartaSans}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-7">
                <h3
                  className={`text-lg font-bold mb-1.5 ${plan.highlight ? "text-white" : "text-gray-900"}`}
                  style={fraunces}
                >
                  {plan.name}
                </h3>
                <p className={`text-sm leading-relaxed ${plan.highlight ? "text-white/50" : "text-gray-500"}`} style={jakartaSans}>
                  {plan.desc}
                </p>
              </div>

              <div className="flex items-end gap-1 mb-2">
                <span
                  className={`text-6xl font-black leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}
                  style={fraunces}
                >
                  {plan.price}€
                </span>
                <span className={`text-sm pb-2.5 ${plan.highlight ? "text-white/40" : "text-gray-400"}`} style={jakartaSans}>/año</span>
              </div>
              <p className="text-xs font-semibold text-[#FF3008] mb-7" style={jakartaSans}>
                Pago único anual · Acceso de por vida
              </p>

              <ul className="space-y-3 flex-1 mb-9">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${plan.highlight ? "bg-[#FF3008]/25" : "bg-[#FF3008]/10"}`}>
                      <Check className="w-3 h-3 text-[#FF3008]" />
                    </div>
                    <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-gray-600"}`} style={jakartaSans}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/checkout-plan?plan=${plan.name === 'Auto-gestión' ? 'auto' : 'managed'}`}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] text-center block
                  ${plan.highlight
                    ? "bg-[#FF3008] text-white hover:shadow-lg hover:shadow-[#FF3008]/30"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                style={jakartaSans}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8" style={jakartaSans}>
          IVA no incluido · Pago único anual · Sin renovación automática
        </p>
      </div>
    </section>
  );
}

function Blog() {
  const posts = REAL_POSTS.slice(0, 3);
  return (
    <section id="blog" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4" style={jakartaSans}>Blog</p>
            <h2 className="text-4xl sm:text-5xl text-gray-900" style={{ ...fraunces, fontWeight: 700 }}>
              Recursos para tu restaurante
            </h2>
          </div>
          <Link
            to="/blog/articulos"
            className="hidden md:flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#FF3008] transition-colors pb-2"
            style={jakartaSans}
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 bg-white border border-stone-100 flex flex-col"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              <div className="h-52 bg-gray-100 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(post.city)}`;
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${post.tagColor}`} style={jakartaSans}>
                    {post.tag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3
                  className="text-gray-900 leading-snug mb-3 text-[16px] group-hover:text-[#FF3008] transition-colors line-clamp-2 flex-1"
                  style={{ ...fraunces, fontWeight: 700 }}
                >
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-5" style={jakartaSans}>{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400" style={jakartaSans}>
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime} de lectura
                  </div>
                  <span className="text-xs font-bold text-[#FF3008] flex items-center gap-0.5 group-hover:gap-1.5 transition-all" style={jakartaSans}>
                    Leer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10 md:hidden">
          <Link to="/blog/articulos" className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-[#FF3008] transition-colors" style={jakartaSans}>
            Ver todos los artículos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-[#0E1119] py-28 relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3008]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2
          className="text-4xl sm:text-6xl text-white leading-[1.08] mb-6"
          style={{ ...frauncesDisplay, fontWeight: 800 }}
        >
          ¿Listo para dejar de pagar<br className="hidden sm:block" />{" "}
          <span className="text-[#FF3008]">el 30% a las plataformas?</span>
        </h2>
        <p className="text-white/50 text-lg mb-12 max-w-xl mx-auto leading-relaxed" style={jakartaSans}>
          Únete a cientos de restaurantes en España que ya venden directo. Sin Glovo. Sin Uber Eats. Sin comisiones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#planes"
            className="bg-[#FF3008] hover:bg-[#d42a07] text-white font-bold px-10 py-4 rounded-full text-base transition-all hover:shadow-2xl hover:shadow-[#FF3008]/30 inline-flex items-center justify-center gap-2"
            style={jakartaSans}
          >
            Empieza por solo 10€/año <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#como-funciona"
            className="border border-white/15 text-white/80 hover:bg-white/8 hover:text-white font-semibold px-10 py-4 rounded-full text-base transition-all"
            style={jakartaSans}
          >
            Cómo funciona
          </a>
        </div>
        <p className="text-white/30 text-xs mt-8" style={jakartaSans}>Pago único anual · Sin comisiones por pedido · Soporte en español</p>
      </div>
    </section>
  );
}


// ─── Page ──────────────────────────────────────────────────────────────────────

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es CartaMenu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CartaMenu es una plataforma SaaS que permite a restaurantes en España recibir pedidos online directamente sin pagar comisiones a plataformas como Glovo o Uber Eats. El restaurante tiene su propia tienda digital y gestiona los pedidos desde un panel de administración."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta CartaMenu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CartaMenu ofrece dos planes anuales: Plan Auto-gestión por 10€/año y Plan Lo hacemos por ti por 20€/año. Son pagos únicos anuales sin comisiones por pedido."
      }
    },
    {
      "@type": "Question",
      "name": "¿Es CartaMenu una alternativa a Glovo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. CartaMenu es una alternativa a Glovo, Uber Eats y Just Eat para restaurantes en España, especialmente en ciudades pequeñas y medianas donde las grandes plataformas no llegan o cobran comisiones muy altas (hasta el 30% por pedido)."
      }
    },
    {
      "@type": "Question",
      "name": "¿En qué ciudades de España funciona CartaMenu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CartaMenu funciona en toda España, con especial foco en ciudades medianas como Alicante, Jerez de la Frontera, Logroño, Girona, Córdoba, Santiago de Compostela, Tarragona, Gijón, Albacete, Pamplona, Salamanca, Huelva, Toledo, Vitoria, A Coruña, Valladolid, Oviedo, León y Santander."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo se tarda en configurar CartaMenu?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Con el plan Auto-gestión puedes tener tu tienda online lista en menos de una hora. Con el plan Lo hacemos por ti, el equipo de CartaMenu se encarga de toda la configuración inicial."
      }
    },
    {
      "@type": "Question",
      "name": "¿CartaMenu cobra comisión por cada pedido?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. CartaMenu no cobra ninguna comisión por pedido. Solo pagas la cuota anual fija (10€ o 20€/año) y todos los ingresos de tus pedidos son 100% tuyos."
      }
    }
  ]
};

export default function BlogLanding() {
  return (
    <div className="min-h-screen antialiased" style={jakartaSans}>
      <SEOHead
        title="Pedidos online para restaurantes en España sin comisiones"
        description="CartaMenu: la plataforma que permite a tu restaurante recibir pedidos online sin pagar el 30% a Glovo o Uber Eats. Desde 10€/año. Sin comisiones por pedido."
        canonical="/blog"
        jsonLd={FAQ_SCHEMA}
      />
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <DemoStores />
      <Pricing />
      <Blog />
      <CtaBanner />
      <BlogFooter />
    </div>
  );
}
