
import React from 'react';

type RestaurantHeroProps = {
  coverImage: string;
  logo: string;
};

const RestaurantHero: React.FC<RestaurantHeroProps> = ({ coverImage, logo }) => {
  return (
    <div className="relative h-52 md:h-72 bg-gray-200 overflow-hidden">
      {/* Cover image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${coverImage})` }}
      />
      {/* Gradient overlay — cinematic warm bottom */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,10,4,0.72) 0%, rgba(20,10,4,0.18) 45%, transparent 100%)' }} />

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 flex items-center justify-center transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 flex items-center justify-center transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RestaurantHero;
