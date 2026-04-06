import React, { createContext, useContext, useState, useEffect } from 'react';

/** Converte hex (#RRGGBB) para o formato HSL sem unidade usado pelo Tailwind: "H S% L%" */
function hexToHslVars(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const DEFAULT_PRIMARY_HSL = '22 100% 50%'; // orange padrão

function applyThemeColor(hex: string | null | undefined) {
  const hsl = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hexToHslVars(hex) : DEFAULT_PRIMARY_HSL;
  document.documentElement.style.setProperty('--primary', hsl);
  document.documentElement.style.setProperty('--ring', hsl);
}
import { useLocation } from 'react-router-dom';
import { StoreInfo } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

// Define the StoreContextType interface
interface StoreContextType {
  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => Promise<void>;
  refreshStoreInfo: () => Promise<void>;
  loading: boolean;
}

// Set defaultStoreInfo with new fields
const defaultStoreInfo: StoreInfo = {
  name: "",
  description: "",
  logo: "",
  banner: "",
  deliveryFee: 0,
  minOrder: 0,
  cuisineType: "",
  address: "",
  lat: null,
  lng: null,
  enableDelivery: true,
  enablePickup: true,
  currency: 'EUR'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);
  const [loading, setLoading] = useState(true);
  const { tenantId, loading: tenantLoading } = useTenant();
  const location = useLocation();

  useEffect(() => {
    // Espera o TenantContext terminar de carregar antes de buscar a loja
    if (tenantLoading) return;
    // Limpa dados do tenant anterior antes de carregar o novo
    setStoreInfo(defaultStoreInfo);
    refreshStoreInfo();
    // eslint-disable-next-line
  }, [tenantId, tenantLoading]);

  const refreshStoreInfo = async () => {
    setLoading(true);
    try {
      const pathname = location.pathname;
      const isRoot = pathname === '/';

      // Se não há tenantId: admin sem login → não carregar; slug route → não carregar; root → fallback id=1
      if (!tenantId) {
        if (!isRoot) {
          setLoading(false);
          return;
        }
      }

      let storeQuery = supabase.from('store_info').select(
        'id,name,description,logo,banner,delivery_fee,min_order,cuisine_type,address,lat,lng,enable_delivery,enable_pickup,currency,stripe_publishable_key,stripe_mode,tenant_id'
      );
      if (tenantId) {
        storeQuery = storeQuery.eq('tenant_id', tenantId);
      } else {
        storeQuery = storeQuery.eq('id', 1);
      }

      // Paralelizar store_info + paypal config (economiza ~150ms)
      const [storeResult, paypalResult] = await Promise.all([
        storeQuery.maybeSingle(),
        tenantId
          ? supabase.from('tenants').select('paypal_client_id, paypal_mode').eq('id', tenantId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      const { data, error } = storeResult;
      const paypalClientId: string | null = paypalResult.data?.paypal_client_id || null;
      const paypalMode: string | null = paypalResult.data?.paypal_mode || null;

      if (data) {
        let loaded: StoreInfo = {
          name: data.name || "",
          description: data.description || "",
          logo: data.logo || "",
          banner: data.banner || "",
          deliveryFee: Number(data.delivery_fee) || 0,
          minOrder: Number(data.min_order) || 0,
          cuisineType: data.cuisine_type || "",
          address: data.address || "",
          lat: typeof data.lat === "number" ? data.lat : null,
          lng: typeof data.lng === "number" ? data.lng : null,
          // Carregar do Supabase (fonte de verdade)
          enableDelivery: typeof data.enable_delivery === 'boolean' ? data.enable_delivery : true,
          enablePickup: typeof data.enable_pickup === 'boolean' ? data.enable_pickup : true,
          currency: (data.currency as 'EUR' | 'USD' | 'BRL') || 'EUR',
          // Stripe fields (sem secret keys — nunca expor ao frontend)
          stripePublishableKey: data.stripe_publishable_key || null,
          stripeMode: data.stripe_mode || null,
          // PayPal public fields from tenants
          paypalClientId,
          paypalMode,
          // Theme (primary_color carregado após migration ser aplicada)
          primaryColor: (data as any).primary_color || null,
          // Tenant
          tenantId: tenantId || null,
        };

        applyThemeColor(loaded.primaryColor);
        setStoreInfo(loaded);
      } else if (error) {
        console.error("Erro ao buscar informações da loja:", error);
        setStoreInfo(defaultStoreInfo);
      }
    } catch (err) {
      console.error("Erro ao buscar informações da loja:", err);
      setStoreInfo(defaultStoreInfo);
    } finally {
      setLoading(false);
    }
  };

  const updateStoreInfo = async (info: Partial<StoreInfo>) => {
    setLoading(true);
    try {
      // Map camelCase fields to snake_case for Supabase
      const mappedInfo: any = {};
      if (info.name !== undefined) mappedInfo.name = info.name;
      if (info.description !== undefined) mappedInfo.description = info.description;
      if (info.logo !== undefined) mappedInfo.logo = info.logo;
      if (info.banner !== undefined) mappedInfo.banner = info.banner;
      if (info.deliveryFee !== undefined) mappedInfo.delivery_fee = info.deliveryFee;
      if (info.minOrder !== undefined) mappedInfo.min_order = info.minOrder;
      if (info.cuisineType !== undefined) mappedInfo.cuisine_type = info.cuisineType;
      // Add new fields
      if (info.address !== undefined) mappedInfo.address = info.address;
      if (info.lat !== undefined) mappedInfo.lat = info.lat;
      if (info.lng !== undefined) mappedInfo.lng = info.lng;
      // Adicionar novos campos para salvar no Supabase
      if (info.enableDelivery !== undefined) mappedInfo.enable_delivery = info.enableDelivery;
      if (info.enablePickup !== undefined) mappedInfo.enable_pickup = info.enablePickup;
      if (info.currency !== undefined) mappedInfo.currency = info.currency;
      // Theme (primary_color só é salvo se a coluna existir no banco)
      const primaryColorValue = info.primaryColor !== undefined ? info.primaryColor : undefined;
      if (primaryColorValue !== undefined) {
        applyThemeColor(primaryColorValue);
      }
      // Stripe public fields mapping (secrets are saved to tenants table separately)
      if (info.stripePublishableKey !== undefined) mappedInfo.stripe_publishable_key = info.stripePublishableKey;
      if (info.stripeMode !== undefined) mappedInfo.stripe_mode = info.stripeMode;

      // Atualizar imediatamente no estado
      setStoreInfo(prev => ({ ...prev, ...info }));

      let updateQuery = supabase.from('store_info').update(mappedInfo);
      if (tenantId) {
        updateQuery = updateQuery.eq('tenant_id', tenantId);
      } else {
        updateQuery = updateQuery.eq('id', 1);
      }
      const { error } = await updateQuery;
      if (error) throw error;
      await refreshStoreInfo();
    } catch (err) {
      console.error("Erro atualizando informações da loja:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreContext.Provider value={{
      storeInfo,
      updateStoreInfo,
      refreshStoreInfo,
      loading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
