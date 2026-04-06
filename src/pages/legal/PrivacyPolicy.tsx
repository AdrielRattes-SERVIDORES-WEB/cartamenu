import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Política de Privacidad"
        description="Política de privacidad de CartaMenu. Cómo recogemos, usamos y protegemos tus datos personales."
        canonical="/privacidad"
        noindex={false}
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
        <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de noviembre de 2025</p>

        <div className="prose prose-gray max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-p:text-gray-600 prose-li:text-gray-600">

          <p>En <strong>CartaMenu</strong> (en adelante, "nosotros", "la empresa" o "el servicio") nos comprometemos a proteger la privacidad de nuestros usuarios. Esta política describe qué datos recogemos, cómo los usamos y cuáles son tus derechos.</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>CartaMenu, con domicilio en Madrid, España. Contacto: <a href="mailto:privacidad@cartamenu.es" className="text-[#FF3008]">privacidad@cartamenu.es</a></p>

          <h2>2. Datos que recogemos</h2>
          <ul>
            <li><strong>Datos de registro:</strong> nombre, correo electrónico y contraseña cuando creas una cuenta.</li>
            <li><strong>Datos de pago:</strong> procesados íntegramente por PayPal. CartaMenu no almacena datos de tarjetas.</li>
            <li><strong>Datos de uso:</strong> páginas visitadas, acciones en el panel de administración, dirección IP y navegador, con fines analíticos y de seguridad.</li>
            <li><strong>Datos de clientes finales:</strong> nombre, dirección y teléfono que los clientes proporcionan al hacer un pedido en tu restaurante. Actúas como responsable de estos datos; CartaMenu es encargado del tratamiento.</li>
          </ul>

          <h2>3. Finalidades y base jurídica</h2>
          <ul>
            <li>Prestar el servicio contratado (base: ejecución de contrato).</li>
            <li>Gestionar pagos y facturación (base: obligación legal y contractual).</li>
            <li>Mejorar la plataforma mediante análisis de uso (base: interés legítimo).</li>
            <li>Enviarte comunicaciones sobre tu cuenta o actualizaciones del servicio (base: ejecución de contrato).</li>
          </ul>

          <h2>4. Conservación de datos</h2>
          <p>Conservamos tus datos mientras mantengas una cuenta activa. Tras la baja, los eliminamos en un plazo máximo de 30 días, salvo obligación legal de conservación.</p>

          <h2>5. Cesión a terceros</h2>
          <p>No vendemos tus datos. Podemos compartirlos con:</p>
          <ul>
            <li><strong>Supabase</strong> (infraestructura de base de datos, alojada en la UE).</li>
            <li><strong>PayPal</strong> (procesamiento de pagos).</li>
            <li><strong>Vercel</strong> (alojamiento de la aplicación).</li>
          </ul>
          <p>Todos ellos actúan como encargados del tratamiento bajo contrato y con garantías adecuadas.</p>

          <h2>6. Tus derechos</h2>
          <p>Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición escribiendo a <a href="mailto:privacidad@cartamenu.es" className="text-[#FF3008]">privacidad@cartamenu.es</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>

          <h2>7. Cookies</h2>
          <p>Usamos cookies técnicas y analíticas. Consulta nuestra <Link to="/cookies" className="text-[#FF3008]">Política de Cookies</Link> para más información.</p>

          <h2>8. Cambios en esta política</h2>
          <p>Notificaremos cualquier cambio relevante por correo electrónico o mediante un aviso visible en la plataforma.</p>
        </div>
      </main>

<BlogFooter />
    </div>
  );
}
