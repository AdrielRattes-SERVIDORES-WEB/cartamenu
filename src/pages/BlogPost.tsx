import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, ArrowRight, Calendar } from 'lucide-react';
import { getPostBySlug, BLOG_POSTS } from '@/data/blogPosts';
import SEOHead from '@/components/SEOHead';
import BlogFooter from '@/components/BlogFooter';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug || '');

  // Scroll to top on every slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  if (!post) return <Navigate to="/blog/articulos" replace />;

  // Show same-tag articles first, then fill with others
  const related = [
    ...BLOG_POSTS.filter((p) => p.slug !== post.slug && p.tag === post.tag),
    ...BLOG_POSTS.filter((p) => p.slug !== post.slug && p.tag !== post.tag),
  ].slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://cartamenu.shop${post.image}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author,
      "jobTitle": post.authorRole,
      "worksFor": {
        "@type": "Organization",
        "name": "CartaMenu",
        "url": "https://cartamenu.shop"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "CartaMenu",
      "url": "https://cartamenu.shop",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cartamenu.shop/favicon.ico"
      }
    },
    "url": `https://cartamenu.shop/blog/${post.slug}`,
    "mainEntityOfPage": `https://cartamenu.shop/blog/${post.slug}`,
    "keywords": [post.tag, post.city, "pedidos online restaurante", "delivery España", "CartaMenu"].join(", "),
    "articleSection": post.tag,
    "inLanguage": "es-ES",
    "about": {
      "@type": "Thing",
      "name": post.city,
      "description": `Restaurantes en ${post.city}, España`
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "CartaMenu",
        "item": "https://cartamenu.shop"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://cartamenu.shop/blog/articulos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://cartamenu.shop/blog/${post.slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
        image={`https://cartamenu.shop${post.image}`}
        type="article"
        article={{
          publishedTime: post.date,
          author: post.author,
          tags: [post.tag, post.city],
        }}
        jsonLd={post.faq ? [articleSchema, breadcrumbSchema, post.faq] : [articleSchema, breadcrumbSchema]}
      />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/blog/articulos" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:block">Volver al blog</span>
          </Link>
          <Link to="/blog" className="flex items-center gap-0.5">
            <span className="text-lg font-black text-gray-900">Carta</span>
            <span className="text-lg font-black text-[#FF3008]">Menu</span>
          </Link>
          <Link
            to="/checkout-plan?plan=auto"
            className="bg-[#FF3008] hover:bg-[#e02b07] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Empieza por 10€/año
          </Link>
        </div>
      </nav>

      <article className="pt-16">
        {/* Hero image */}
        <div className="h-64 sm:h-80 md:h-96 bg-gray-100 overflow-hidden relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/1200x600/1B1F2A/ffffff?text=${encodeURIComponent(post.city)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-4xl mx-auto">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${post.tagColor}`}>
              {post.tag}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Meta bar */}
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-[#FF3008] flex items-center justify-center text-white text-xs font-black">C</div>
              <span className="font-medium text-gray-700">{post.author}</span>
              <span className="text-gray-400">· {post.authorRole}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime} de lectura
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium border-l-4 border-[#FF3008] pl-5">
            {post.excerpt}
          </p>

          {/* Article body */}
          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-black prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
              prose-strong:text-gray-900
              prose-a:text-[#FF3008] prose-a:no-underline hover:prose-a:underline
              prose-ul:space-y-2 prose-li:text-gray-600
              prose-blockquote:border-l-4 prose-blockquote:border-[#FF3008]
              prose-blockquote:bg-gray-50 prose-blockquote:rounded-r-xl
              prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Inline CTA */}
          <div className="my-12 bg-[#1B1F2A] rounded-2xl p-8 text-center">
            <p className="text-sm font-bold text-[#FF3008] uppercase tracking-widest mb-2">CartaMenu</p>
            <h3 className="text-2xl font-black text-white mb-3">
              Tu restaurante merece su propio canal
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Sin comisiones. Sin Glovo. Empieza hoy desde 10€/año.
            </p>
            <Link
              to="/checkout-plan?plan=auto"
              className="inline-flex items-center gap-2 bg-[#FF3008] hover:bg-[#e02b07] text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
            >
              Empieza por 10€/año <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Más artículos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x300/f3f4f6/9ca3af?text=${encodeURIComponent(p.city)}`;
                      }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-2 ${p.tagColor}`}>{p.tag}</span>
                    <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-[#FF3008] transition-colors flex-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {p.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogFooter />
    </div>
  );
}
