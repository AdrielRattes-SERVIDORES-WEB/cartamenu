
import React from 'react';
import { useTranslation } from 'react-i18next';

type RestaurantInfoProps = {
  name: string;
  cuisine: string;
  distance: string;
  minOrder: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: string;
};

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  name,
  cuisine,
  distance,
  minOrder,
  rating,
  reviews,
  deliveryTime,
  deliveryFee,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="pt-3 pb-2 px-4">
      {/* Sub-info row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">{distance}</span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-500">{t('menu.minOrder', { value: minOrder })}</span>
      </div>

      {/* Info pills */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {/* Rating */}
        <button className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/70 rounded-full px-3 py-1.5 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 flex-shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span className="text-sm font-semibold text-stone-800">{rating}</span>
          <span className="text-xs text-stone-400">({reviews})</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-stone-400">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Delivery time */}
        <div className="flex items-center gap-1.5 bg-stone-100/80 rounded-full px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-sm text-stone-600">{deliveryTime}</span>
        </div>

        {/* Delivery fee */}
        <div className="flex items-center gap-1.5 bg-stone-100/80 rounded-full px-3 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500 flex-shrink-0">
            <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span className="text-sm text-stone-600">{deliveryFee}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;
