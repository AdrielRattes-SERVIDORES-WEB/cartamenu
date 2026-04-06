import React from 'react';
import { Link } from 'react-router-dom';

const jakartaSans: React.CSSProperties = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const FOOTER_LINKS = [
  {
    title: 'Producto',
    links: [
      { label: 'Cómo funciona', href: '/blog#como-funciona' },
      { label: 'Precios', href: '/blog#planes' },
      { label: 'Blog', href: '/blog/articulos' },
      { label: 'Actualizaciones', href: '/blog/articulos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '/sobre-nosotros' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Trabaja con nosotros', href: '/contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacidad' },
      { label: 'Términos de uso', href: '/terminos' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

export default function BlogFooter() {
  return (
    <footer className="bg-[#0A0C12] border-t border-white/5 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-1">
            <Link to="/blog" className="flex items-center gap-0.5 mb-4">
              <span className="text-xl font-black text-white" style={jakartaSans}>Carta</span>
              <span className="text-xl font-black text-[#FF3008]" style={jakartaSans}>Menu</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed" style={jakartaSans}>
              La plataforma de delivery propia para restaurantes en España.
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-5" style={jakartaSans}>
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                      style={jakartaSans}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/25" style={jakartaSans}>
            © 2025 CartaMenu. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link to="/privacidad" className="text-xs text-white/25 hover:text-white/60 transition-colors" style={jakartaSans}>Privacidad</Link>
            <Link to="/terminos" className="text-xs text-white/25 hover:text-white/60 transition-colors" style={jakartaSans}>Términos</Link>
            <Link to="/cookies" className="text-xs text-white/25 hover:text-white/60 transition-colors" style={jakartaSans}>Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
