import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Sobre nosotros"
        description="CartaMenu nació para que los restaurantes de España puedan recibir pedidos online sin depender de Glovo o Uber Eats. Conoce nuestra historia y misión."
        canonical="/sobre-nosotros"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-0.5">
            <span className="text-xl font-black text-gray-900">Carta</span>
            <span className="text-xl font-black text-[#FF3008]">Menu</span>
          </Link>
          <Link
            to="/checkout-plan?plan=auto"
            className="bg-[#FF3008] hover:bg-[#e02b07] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Empieza por 10€/año
          </Link>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero */}
        <section className="bg-[#1B1F2A] py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4">Quiénes somos</p>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-6">
              Construimos el canal directo<br />
              <span className="text-[#FF3008]">de los restaurantes de España</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              CartaMenu nació con una convicción clara: los restaurantes merecen vender sin regalar el 30% de sus ingresos a plataformas que no les pertenecen.
            </p>
          </div>
        </section>

        {/* Misión */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4">Nuestra misión</p>
                <h2 className="text-3xl font-black text-gray-900 mb-5 leading-tight">
                  Devolver el negocio a quien cocina
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  En España hay miles de pizzerías, hamburgueserías, bocaterías y casas de comidas que llevan décadas sirviendo a sus barrios. Muchas están en ciudades medianas donde Glovo ni siquiera opera.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Estas mismas ciudades — Logroño, Albacete, Gijón, Santander, León — tienen restaurantes extraordinarios que merecen su propio canal digital. Sin intermediarios. Sin comisiones.
                </p>
              </div>
              <div className="bg-gray-50 rounded-3xl p-10">
                <div className="space-y-8">
                  {[
                    { value: '+200', label: 'Restaurantes activos', desc: 'En toda España' },
                    { value: '0%', label: 'Comisión por pedido', desc: 'Todo el dinero es tuyo' },
                    { value: '19', label: 'Ciudades cubiertas', desc: 'Y creciendo cada mes' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-5">
                      <span className="text-4xl font-black text-[#FF3008] w-20 shrink-0">{stat.value}</span>
                      <div>
                        <p className="font-black text-gray-900">{stat.label}</p>
                        <p className="text-sm text-gray-400">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-4">Valores</p>
            <h2 className="text-3xl font-black text-gray-900 mb-12">Lo que nos guía</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  title: 'Transparencia',
                  desc: 'Precios claros, sin letra pequeña. 10€ o 20€ al año es todo lo que pagas.',
                },
                {
                  title: 'Independencia',
                  desc: 'Tu canal, tus datos, tus clientes. No compartimos tu información con competidores.',
                },
                {
                  title: 'Simplicidad',
                  desc: 'Una herramienta que funciona en 5 minutos, sin formación ni soporte técnico.',
                },
              ].map((v) => (
                <div key={v.title} className="bg-white rounded-2xl p-7 border border-gray-200">
                  <h3 className="font-black text-gray-900 text-lg mb-3">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#1B1F2A] text-center">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-black text-white mb-4">¿Tienes un restaurante en España?</h2>
            <p className="text-gray-400 mb-8">Únete a los más de 200 restaurantes que ya venden directo con CartaMenu.</p>
            <Link
              to="/checkout-plan?plan=auto"
              className="inline-flex items-center gap-2 bg-[#FF3008] hover:bg-[#e02b07] text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Empieza por 10€/año <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

<BlogFooter />
    </div>
  );
}
