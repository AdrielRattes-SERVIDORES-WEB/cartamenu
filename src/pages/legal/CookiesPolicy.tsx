import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Política de Cookies"
        description="Política de cookies de CartaMenu. Qué cookies usamos y cómo puedes gestionarlas."
        canonical="/cookies"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-0.5">
            <span className="text-xl font-black text-gray-900">Carta</span>
            <span className="text-xl font-black text-[#FF3008]">Menu</span>
          </Link>
          <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de noviembre de 2025</p>

        <div className="prose prose-gray max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-p:text-gray-600 prose-li:text-gray-600">

          <p>Esta política explica qué son las cookies, cuáles usamos en <strong>CartaMenu</strong> y cómo puedes controlarlas.</p>

          <h2>1. ¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando lo visitas. Sirven para que el sitio funcione correctamente, recuerde tus preferencias y recopile información estadística.</p>

          <h2>2. Cookies que usamos</h2>

          <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">Cookies técnicas (necesarias)</h3>
          <p>Son imprescindibles para el funcionamiento del servicio. No pueden desactivarse.</p>
          <ul>
            <li><strong>sb-auth-token</strong> — Gestión de sesión de usuario (Supabase). Duración: sesión.</li>
            <li><strong>sb-refresh-token</strong> — Renovación automática de sesión. Duración: 7 días.</li>
          </ul>

          <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">Cookies analíticas</h3>
          <p>Nos ayudan a entender cómo se usa la plataforma para mejorarla. Solo se activan si las aceptas.</p>
          <ul>
            <li><strong>_ga, _ga_*</strong> — Google Analytics (estadísticas de visitas anónimas). Duración: 2 años.</li>
          </ul>

          <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">Cookies de terceros</h3>
          <ul>
            <li><strong>PayPal</strong> — Cuando usas el proceso de pago. Consulta la <a href="https://www.paypal.com/es/webapps/mpp/ua/cookie-full" target="_blank" rel="noopener noreferrer" className="text-[#FF3008]">política de cookies de PayPal</a>.</li>
          </ul>

          <h2>3. Cómo gestionar las cookies</h2>
          <p>Puedes configurar tu navegador para bloquear o eliminar cookies:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#FF3008]">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web" target="_blank" rel="noopener noreferrer" className="text-[#FF3008]">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#FF3008]">Safari</a></li>
          </ul>
          <p>Ten en cuenta que desactivar cookies técnicas puede impedir el correcto funcionamiento del servicio.</p>

          <h2>4. Más información</h2>
          <p>Para cualquier consulta sobre cookies escríbenos a <a href="mailto:privacidad@cartamenu.shop" className="text-[#FF3008]">privacidad@cartamenu.shop</a> o consulta nuestra <Link to="/privacidad" className="text-[#FF3008]">Política de Privacidad</Link>.</p>
        </div>
      </main>

<BlogFooter />
    </div>
  );
}
