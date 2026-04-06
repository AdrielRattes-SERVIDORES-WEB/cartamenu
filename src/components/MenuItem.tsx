import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { useTenant } from '@/contexts/TenantContext';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { FoodItem } from '@/types/product';

type MenuItemProps = {
  item: FoodItem;
  featured?: boolean;
  hideImage?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ item, featured = false, hideImage = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { addToCart } = useCart();
  const { storeInfo } = useStore();
  const { tenantId } = useTenant();
  const [hasOptions, setHasOptions] = useState(false);

  useEffect(() => {
    const checkProductOptions = async () => {
      try {
        let query = supabase.from('product_options').select('id').eq('product_id', item.id).limit(1);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setHasOptions(true);
        }
      } catch (error) {
        console.error('Error checking product options:', error);
      }
    };

    checkProductOptions();
  }, [item.id]);

  const productPath = slug ? `/${slug}/product/${item.id}` : `/product/${item.id}`;

  const handleClick = () => {
    navigate(productPath);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasOptions) {
      navigate(productPath);
      return;
    }

    addToCart({
      id: `${item.id}-${Date.now()}`,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      selectedOptions: {},
      totalPrice: item.price,
    });
  };

  return (
    <div
      className="flex gap-3 p-3 rounded-2xl hover:bg-orange-50/40 active:bg-orange-50/70 transition-colors cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 gap-1 min-h-[6.5rem]">
        {/* Popular badge */}
        {featured && item.popular && (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full w-fit border border-amber-100">
            🔥 {t('menu.mostOrdered')}
          </span>
        )}

        {/* Vegetarian badge */}
        {item.vegetarian && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-600 inline-block" />
            Vegetariano
          </span>
        )}

        <h3 className="font-display font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2" style={{ fontVariationSettings: "'opsz' 18" }}>
          {item.name}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-400 leading-snug line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price + add button row — mt-auto ancora sempre ao fundo */}
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <div className="flex items-baseline gap-1">
            {hasOptions && (
              <span className="text-xs text-gray-400 font-medium">{t('menu.from')}</span>
            )}
            <span className="font-display text-base font-bold text-gray-900" style={{ fontVariationSettings: "'opsz' 14" }}>
              {formatCurrency(item.price, storeInfo.currency ?? 'EUR')}
            </span>
          </div>

          <button
            className="add-btn"
            onClick={handleAddToCart}
            aria-label={hasOptions ? t('menu.selectOptions') : t('menu.addToCart')}
          >
            {hasOptions ? (
              <ShoppingCart className="h-4 w-4" />
            ) : (
              <span className="text-lg font-bold leading-none">+</span>
            )}
          </button>
        </div>
      </div>

      {/* Image */}
      {!hideImage && (
        <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default MenuItem;
