
import React from 'react';
import MenuItem from './MenuItem';

export type FoodItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  popular?: boolean;
  vegetarian?: boolean;
  category?: string;
};

type FeaturedItemsProps = {
  title: string;
  items: FoodItem[];
};

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ title, items }) => {
  return (
    <section className="max-w-full overflow-hidden">
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-5 text-stone-900" style={{ fontVariationSettings: "'opsz' 32, 'SOFT' 30" }}>{title}</h2>
      <div className="featured-grid">
        {items.map(item => (
          <div className="rounded-2xl bg-white p-4 flex gap-4 max-w-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: '0 2px 12px rgba(120,60,10,0.08), 0 1px 3px rgba(120,60,10,0.06)' }} key={item.id}>
            <img
              src={item.image}
              alt={item.name}
              className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-2xl object-cover"
              loading="lazy"
            />
            <MenuItem item={item} featured hideImage />
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedItems;

