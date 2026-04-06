import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { BLOG_POSTS, getFeaturedPost } from '@/data/blogPosts';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

const ALL_TAGS = ['Todos', ...Array.from(new Set(BLOG_POSTS.map((p) => p.tag)))];

export default function BlogList() {
  const [activeTag, setActiveTag] = useState('Todos');
  const [query, setQuery] = useState('');
  const featured = getFeaturedPost();

  const filtered = BLOG_POSTS.filter((p) => {
    const matchTag = activeTag === 'Todos' || p.tag === activeTag;
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      p.city.toLowerCase().includes(query.toLowerCase());
    return matchTag && matchQuery;
  });

  const BLOG_LIST_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://cartamenu.es/blog/articulos",
    "name": "Blog CartaMenu — Recursos para restaurantes en España",
    "description": "Guías prácticas para digitalizar tu restaurante, recibir pedidos online y dejar de pagar comisiones en ciudades de España.",
    "url": "https://cartamenu.es/blog/articulos",
    "publisher": {
      "@type": "Organization",
      "name": "CartaMenu",
      "url": "https://cartamenu.es"
    },
    "blogPost": BLOG_POSTS.map((p) => ({
      "@type": "BlogPosting",
      "headline": p.title,
      "url": `https://cartamenu.es/blog/${p.slug}`,
      "datePublished": p.date,
      "description": p.excerpt,
      "author": { "@type": "Person", "name": p.author },
      "keywords": [p.tag, p.city, "pedidos online", "restaurante España"].join(", "),
    })),
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title="Blog — Recursos para restaurantes en España"
        description="Guías prácticas para digitalizar tu restaurante, recibir pedidos online y dejar de pagar comisiones a Glovo o Uber Eats en ciudades de España."
        canonical="/blog/articulos"
        jsonLd={BLOG_LIST_SCHEMA}
      />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-0.5">
            <span className="text-xl font-black text-gray-900">Carta</span>
            <span className="text-xl font-black text-[#FF3008]">Menu</span>
            <span className="ml-2 text-xs font-semibold text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">Blog</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Inicio
            </Link>
            <Link
              to="/checkout-plan?plan=auto"
              className="bg-[#FF3008] hover:bg-[#e02b07] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              Empieza por 10€/año
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Header */}
        <section className="bg-gray-50 border-b border-gray-200 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-3">Blog</p>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 max-w-2xl leading-tight">
              Recursos para restaurantes en España
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mb-8">
              Guías prácticas para digitalizar tu restaurante, recibir pedidos online y dejar de pagar comisiones — especialmente en ciudades donde Glovo no llega.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ciudad, tema..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF3008] focus:ring-2 focus:ring-[#FF3008]/10 transition-all bg-white"
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {/* Featured post */}
          {featured && activeTag === 'Todos' && !query && (
            <Link
              to={`/blog/${featured.slug}`}
              className="group block mb-14 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:grid md:grid-cols-2"
            >
              {/* Image */}
              <div className="h-56 md:h-full bg-gray-100 relative overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/800x500/1B1F2A/ffffff?text=${encodeURIComponent(featured.city)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-4 left-4 bg-[#FF3008] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Destacado
                </span>
              </div>

              {/* Content */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-4 ${featured.tagColor}`}>
                  {featured.tag}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4 group-hover:text-[#FF3008] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime} de lectura
                    </span>
                    <span>·</span>
                    <span>{new Date(featured.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <span className="text-sm font-bold text-[#FF3008] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Leer <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${activeTag === tag
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No hay artículos para "{query}"</p>
              <p className="text-sm mt-1">Prueba con otra búsqueda</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-white flex flex-col"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-100 overflow-hidden relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(post.city)}`;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${post.tagColor}`}>
                        {post.tag}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-black text-gray-900 leading-snug mb-2 text-[15px] group-hover:text-[#FF3008] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime} de lectura
                      </span>
                      <span className="text-xs font-bold text-[#FF3008] flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                        Leer <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-20 bg-[#1B1F2A] rounded-3xl p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              ¿Listo para digitalizar tu restaurante?
            </h2>
            <p className="text-gray-400 mb-7 max-w-md mx-auto">
              Sin comisiones. Sin Glovo. Tu propio canal de pedidos desde 10€/año.
            </p>
            <Link
              to="/checkout-plan?plan=auto"
              className="inline-flex items-center gap-2 bg-[#FF3008] hover:bg-[#e02b07] text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Empieza por 10€/año <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <BlogFooter />
    </div>
  );
}
