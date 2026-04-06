import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const StickyCartBar: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { t } = useTranslation();
  const { getItemsCount, getCartTotal } = useCart();
  const { storeInfo } = useStore();

  const count = getItemsCount();
  const total = getCartTotal();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 backdrop-blur-md border-t border-amber-100/50" style={{ background: 'rgba(250,246,241,0.88)' }}>
      <button
        onClick={() => navigate(slug ? `/${slug}/cart` : '/cart')}
        className="w-full flex items-center justify-between rounded-full px-5 py-3.5 text-white font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-150"
        style={{ background: 'linear-gradient(135deg, #a33800, #ff7941)' }}
      >
        <span className="bg-white/25 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {count}
        </span>
        <span className="text-base tracking-tight">{t('cart.viewCart')}</span>
        <span className="font-bold text-base flex-shrink-0">
          {formatCurrency(total, storeInfo.currency ?? 'EUR')}
        </span>
      </button>
    </div>
  );
};

export default StickyCartBar;
