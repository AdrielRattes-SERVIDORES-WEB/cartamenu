
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import Header from '@/components/Header';
import RestaurantHero from '@/components/RestaurantHero';
import FeaturedItems from '@/components/FeaturedItems';
import MenuTabs from '@/components/MenuTabs';
import MenuItem from '@/components/MenuItem';
import StickyCartBar from '@/components/StickyCartBar';
import type { FoodItem } from '@/components/FeaturedItems';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

// Export the FOOD_ITEMS array so it can be imported in other files
export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "1",
    name: "Esfiha de Carne",
    description: "Deliciosa esfiha de carne temperada com especiarias árabes",
    price: 7.99,
    image: "https://source.unsplash.com/featured/?esfiha,meat",
    popular: true,
    category: "Esfihas"
  },
  {
    id: "2",
    name: "Esfiha de Queijo",
    description: "Esfiha recheada com queijo especial derretido",
    price: 7.50,
    image: "https://source.unsplash.com/featured/?esfiha,cheese",
    popular: true,
    category: "Esfihas"
  },
  {
    id: "3",
    name: "Kibe Frito",
    description: "Kibe tradicional frito, crocante por fora e suculento por dentro",
    price: 8.99,
    image: "https://source.unsplash.com/featured/?kibe,arabic",
    popular: true,
    category: "Kibes"
  }
];

const Index = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeInfo, loading: storeLoading } = useStore();
  const { tenantId, loading: tenantLoading } = useTenant();
  const { slug } = useParams<{ slug?: string }>();
  const { logout } = useUser();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryItems, setCategoryItems] = useState<{[key: string]: FoodItem[]}>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sincronizar idioma com URL
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && ['en', 'es', 'it'].includes(langParam)) {
      if (i18n.language !== langParam) {
        i18n.changeLanguage(langParam);
      }
    }
  }, [searchParams, i18n]);

  // Adicionar logs para depuração
  // Buscar produtos e categorias do Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        if (!tenantId) return;

        // Paralelizar categories + products (economiza ~200ms)
        const [categoriesResult, productsResult] = await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('name', { ascending: true }),
          supabase
            .from('products')
            .select('*, categories (name)')
            .eq('tenant_id', tenantId)
            .order('position', { ascending: true })
            .order('name', { ascending: true }),
        ]);

        const { data: categoriesData, error: categoriesError } = categoriesResult;
        const { data: productsData, error: productsError } = productsResult;

        if (categoriesError?.message?.toLowerCase().includes("jwt expired") ||
            productsError?.message?.toLowerCase().includes("jwt expired")) {
          setLoadError(t('common.error'));
          setIsLoading(false);
          setTimeout(() => logout(), 2000);
          return;
        }

        if (categoriesError) {
          setLoadError(t('common.error') + ': ' + categoriesError.message);
          setCategories([]); setCategoryItems({}); setFoodItems([]);
          return;
        }

        if (!categoriesData || categoriesData.length === 0) {
          setCategories([]); setCategoryItems({});
          setLoadError(t('common.error'));
          setFoodItems([]);
          setIsLoading(false);
          return;
        }

        if (productsError) {
          setLoadError(t('common.error') + ': ' + productsError.message);
          setFoodItems([]);
          return;
        }

        if (!productsData || productsData.length === 0) {
          setFoodItems([]);
          setLoadError(t('common.error'));
          setIsLoading(false);
          return;
        }

        // Mapear produtos para o formato FoodItem
        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          price: Number(product.price),
          image: product.image_url || "https://source.unsplash.com/featured/?food",
          popular: product.popular || false,
          vegetarian: product.vegetarian || false,
          category: product.categories?.name || "Sem categoria"
        }));

        // Filtrar produtos populares para destaques
        const popularProducts = formattedProducts.filter(item => item.popular);
        setFoodItems(popularProducts.length > 0 ? popularProducts : formattedProducts.slice(0, 3));

        // Organizar produtos por categoria
        const categoryNames = categoriesData.map(cat => cat.name);
        const productsByCategory: {[key: string]: FoodItem[]} = {};

        categoryNames.forEach(catName => {
          productsByCategory[catName] = formattedProducts.filter(
            product => product.category === catName
          );
        });

        setCategories(categoryNames);
        setCategoryItems(productsByCategory);

        // Definir a primeira categoria como ativa, se existir
        if (categoryNames.length > 0 && !activeTab) {
          setActiveTab(categoryNames[0]);
        }

      } catch (error: any) {
        if (error?.message?.toLowerCase().includes("jwt expired")) {
          setLoadError(t('common.error'));
          setIsLoading(false);
          setTimeout(() => {
            logout();
          }, 2000);
          return;
        }
        console.error("[Index] Erro inesperado ao buscar dados:", error);
        setLoadError(t('common.error') + ': ' + (typeof error === "string" ? error : error.message));
        setFoodItems([]);
        setCategories([]);
        setCategoryItems({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [t, tenantId]);

  // Slug na URL mas tenant não encontrado → 404
  if (slug && !tenantLoading && !tenantId) {
    return <NotFound />;
  }

  if (tenantLoading || storeLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F1]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] pb-28">
      <Header 
        restaurantName={storeInfo.name}
        showSearch={true}
      />

      {/* Banner */}
      <RestaurantHero coverImage={storeInfo.banner} logo={storeInfo.logo} />

      {/* Info card — sobe sobre o banner com border-radius + logo saindo pelo topo */}
      <div className="bg-[#FAF6F1] -mt-5 rounded-t-3xl relative z-10 px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Logo — sai pelo topo do card */}
          <div className="-mt-14 flex-shrink-0 w-24 h-24 rounded-full border-4 border-[#FAF6F1] shadow-xl overflow-hidden">
            <img
              src={storeInfo.logo || '/placeholder.svg'}
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
          </div>
          {/* Nome + tipo */}
          <div className="pt-1 min-w-0">
            <h1
              className="font-display text-[1.3rem] font-bold text-stone-900 tracking-tight leading-tight"
              style={{ fontVariationSettings: "'opsz' 32, 'SOFT' 30" }}
            >
              {storeInfo.name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{storeInfo.cuisineType}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <span>2,0 km</span>
          <span>·</span>
          <span>{t('menu.minOrder', { value: formatCurrency(storeInfo.minOrder, storeInfo.currency ?? 'EUR') })}</span>
        </div>

        {/* Pills */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/70 rounded-full px-3 py-1.5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 flex-shrink-0">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-semibold text-stone-800">4.8</span>
            <span className="text-xs text-stone-400">(1400)</span>
          </button>
          <div className="flex items-center gap-1.5 bg-stone-100/80 rounded-full px-3 py-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500 flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-sm text-stone-600">55–65 min</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100/80 rounded-full px-3 py-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500 flex-shrink-0">
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span className="text-sm text-stone-600">{formatCurrency(storeInfo.deliveryFee, storeInfo.currency ?? 'EUR')}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/70 px-4 py-5">
        {isLoading ? (
          <div className="p-8 text-center">{t('common.loading')}</div>
        ) : loadError ? (
          <div className="p-8 text-center text-red-600">
            {loadError}
          </div>
        ) : (
          <FeaturedItems title={t('menu.featured')} items={foodItems} />
        )}
      </div>

      <div className="h-2 bg-[#FAF6F1]"></div>

      <div className="bg-white/70">
        {isLoading ? (
          <div className="p-8 text-center">{t('common.loading')}</div>
        ) : loadError ? (
          <div className="p-8 text-center text-red-600">
            {loadError}
          </div>
        ) : categories.length > 0 ? (
          <>
            <MenuTabs
              tabs={categories}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="p-4 max-w-full overflow-hidden">
              <h2 className="font-display text-xl font-bold mb-4 text-stone-800" style={{ fontVariationSettings: "'opsz' 24, 'SOFT' 30" }}>{activeTab}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full">
                {categoryItems[activeTab]?.length > 0 ? (
                  categoryItems[activeTab]?.map(item => (
                    <MenuItem key={item.id} item={item} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 col-span-full">{t('common.search')}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {t('common.loading')}
          </div>
        )}
      </div>
      
      <StickyCartBar />
    </div>
  );
};

export default Index;

import { formatCurrency } from '@/lib/utils';

