import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Términos de Uso"
        description="Términos y condiciones de uso de CartaMenu. Lee las condiciones que rigen el uso de nuestra plataforma de pedidos online para restaurantes."
        canonical="/terminos"
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
        <h1 className="text-4xl font-black text-gray-900 mb-2">Términos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de noviembre de 2025</p>

        <div className="prose prose-gray max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-p:text-gray-600 prose-li:text-gray-600">

          <p>Al registrarte y usar <strong>CartaMenu</strong> aceptas los presentes términos. Si no estás de acuerdo, no utilices el servicio.</p>

          <h2>1. Descripción del servicio</h2>
          <p>CartaMenu es una plataforma SaaS que permite a restaurantes y negocios de alimentación crear su propia tienda online de pedidos y delivery, sin pagar comisiones por pedido a plataformas de terceros.</p>

          <h2>2. Registro y cuenta</h2>
          <ul>
            <li>Debes ser mayor de 18 años y tener capacidad legal para contratar.</li>
            <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
            <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
          </ul>

          <h2>3. Planes y pagos</h2>
          <ul>
            <li><strong>Plan Auto-gestión:</strong> 10€/año (IVA no incluido).</li>
            <li><strong>Plan Lo hacemos por ti:</strong> 20€/año (IVA no incluido).</li>
            <li>Los pagos se procesan a través de PayPal. La renovación es anual.</li>
            <li>No hay reembolsos una vez activado el servicio, salvo incumplimiento por nuestra parte.</li>
          </ul>

          <h2>4. Obligaciones del usuario</h2>
          <ul>
            <li>Usar el servicio de forma lícita y conforme a estos términos.</li>
            <li>No revender ni sublicenciar el servicio a terceros.</li>
            <li>No intentar acceder a sistemas o datos de otros usuarios.</li>
            <li>Cumplir la normativa aplicable (fiscal, sanitaria, laboral) en relación con tu restaurante.</li>
          </ul>

          <h2>5. Contenido del usuario</h2>
          <p>Eres el único responsable del contenido que publicas (menús, precios, imágenes). CartaMenu no revisa ni valida dicho contenido y no se hace responsable de su exactitud.</p>

          <h2>6. Disponibilidad del servicio</h2>
          <p>Nos esforzamos por mantener una disponibilidad del 99,5% mensual. Podemos realizar tareas de mantenimiento con aviso previo. No garantizamos disponibilidad ininterrumpida.</p>

          <h2>7. Limitación de responsabilidad</h2>
          <p>CartaMenu no será responsable de pérdidas de ingresos, datos o negocio derivadas del uso o imposibilidad de uso del servicio, salvo dolo o negligencia grave.</p>

          <h2>8. Propiedad intelectual</h2>
          <p>El software, diseño y marca CartaMenu son propiedad exclusiva de la empresa. El usuario conserva todos los derechos sobre su contenido.</p>

          <h2>9. Cancelación</h2>
          <p>Puedes cancelar tu cuenta en cualquier momento desde el panel de administración. El acceso se mantendrá hasta el final del período pagado.</p>

          <h2>10. Ley aplicable</h2>
          <p>Estos términos se rigen por la legislación española. Para cualquier disputa, las partes se someten a los juzgados de Madrid, salvo que la normativa de consumidores establezca otro fuero.</p>

          <h2>11. Contacto</h2>
          <p>Para cualquier consulta sobre estos términos: <a href="mailto:legal@cartamenu.es" className="text-[#FF3008]">legal@cartamenu.es</a></p>
        </div>
      </main>

<BlogFooter />
    </div>
  );
}
