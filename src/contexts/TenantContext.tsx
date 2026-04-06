import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  slug: string;
  custom_domain: string | null;
  plan: string;
  status: string;
  stripe_publishable_key: string | null;
  stripe_mode: string | null;
  paypal_client_id: string | null;
  paypal_mode: string | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  tenantId: null,
  loading: true,
  error: null,
});

export const useTenant = () => useContext(TenantContext);

const SYSTEM_ROUTES = new Set([
  'admin', 'blog', 'checkout', 'cart', 'login', 'register',
  'customer', 'novo', 'checkout-plan', 'superadmin', 'product',
  'sobre-nosotros', 'contacto', 'privacidad', 'terminos', 'cookies',
  'claim-order', 'admin-login', 'admin-register',
]);

function getSlugFromPath(pathname: string): string | null {
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && !SYSTEM_ROUTES.has(first)) return first;
  return null;
}

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setLoading(true);

      try {
        const isAdmin = location.pathname.startsWith('/admin');
        let data: Tenant | null = null;

        // Admin: buscar pelo usuário logado
        if (isAdmin) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const res = await supabase
              .from('tenants')
              .select('*')
              .eq('owner_id', session.user.id)
              .eq('status', 'active')
              .maybeSingle();
            data = res.data;
          }
        }

        // Slug na URL
        if (!data) {
          const slug = getSlugFromPath(location.pathname);
          if (slug) {
            const res = await supabase
              .from('tenants')
              .select('*')
              .eq('slug', slug)
              .eq('status', 'active')
              .maybeSingle();
            data = res.data;
          }
        }

        // Custom domain
        if (!data) {
          const hostname = window.location.hostname;
          if (hostname !== 'localhost' && !hostname.includes('vercel.app')) {
            const res = await supabase
              .from('tenants')
              .select('*')
              .eq('custom_domain', hostname)
              .eq('status', 'active')
              .maybeSingle();
            data = res.data;
          }
        }

        if (!cancelled) setTenant(data);
      } catch {
        if (!cancelled) setError('Erro ao carregar loja');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    resolve();

    // Re-resolver quando auth mudar
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) resolve();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // Usar apenas a "raiz" do pathname para evitar re-fetch em cada sub-rota do admin
  }, [location.pathname.split('/').slice(0, 2).join('/')]);

  return (
    <TenantContext.Provider value={{ tenant, tenantId: tenant?.id ?? null, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};
