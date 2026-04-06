import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function Contacto() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // En producción: enviar a un servicio de email (Resend, EmailJS, etc.)
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Contacto"
        description="¿Tienes alguna pregunta sobre CartaMenu? Escríbenos y te respondemos en menos de 24 horas."
        canonical="/contacto"
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

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-3">Contacto</p>
            <h1 className="text-4xl font-black text-gray-900 mb-3">¿Hablamos?</h1>
            <p className="text-gray-500 text-lg">Respondemos a todos los mensajes en menos de 24 horas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF3008]/10 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#FF3008]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 mb-1">Email</p>
                  <a href="mailto:hola@cartamenu.shop" className="text-sm text-[#FF3008] hover:underline">hola@cartamenu.shop</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF3008]/10 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#FF3008]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 mb-1">Horario de soporte</p>
                  <p className="text-sm text-gray-500">Lunes a viernes<br />9:00 – 19:00 (CET)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#FF3008]/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#FF3008]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 mb-1">Empresa</p>
                  <p className="text-sm text-gray-500">CartaMenu<br />Madrid, España 🇪🇸</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <p className="font-black text-gray-900 mb-2 text-sm">¿Quieres unirte al equipo?</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Siempre buscamos personas apasionadas por los restaurantes y la tecnología.</p>
                <a href="mailto:jobs@cartamenu.shop" className="text-xs font-bold text-[#FF3008] flex items-center gap-1 hover:gap-2 transition-all">
                  jobs@cartamenu.shop <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-black text-gray-900 mb-2">¡Mensaje enviado!</h2>
                  <p className="text-gray-500">Te respondemos en menos de 24 horas en <strong>{form.email}</strong>.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Tu nombre"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF3008] focus:ring-2 focus:ring-[#FF3008]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="tu@restaurante.es"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF3008] focus:ring-2 focus:ring-[#FF3008]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Asunto</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF3008] focus:ring-2 focus:ring-[#FF3008]/10 transition-all bg-white"
                    >
                      <option value="">Selecciona un motivo</option>
                      <option value="soporte">Soporte técnico</option>
                      <option value="ventas">Información sobre planes</option>
                      <option value="facturacion">Facturación y pagos</option>
                      <option value="partnership">Colaboraciones</option>
                      <option value="empleo">Empleo</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mensaje</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF3008] focus:ring-2 focus:ring-[#FF3008]/10 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF3008] hover:bg-[#e02b07] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Enviar mensaje <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Al enviar aceptas nuestra{' '}
                    <Link to="/privacidad" className="text-[#FF3008] hover:underline">Política de Privacidad</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

<BlogFooter />
    </div>
  );
}
