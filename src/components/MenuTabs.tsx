import React, { useState } from 'react';

type MenuTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const MenuTabs: React.FC<MenuTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="sticky top-[57px] z-10 bg-[#FAF6F1]/95 backdrop-blur-md border-b border-amber-100/80">
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex whitespace-nowrap px-4 gap-0 py-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                relative px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${activeTab === tab
                  ? 'text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2.5px] after:bg-primary after:rounded-full'
                  : 'text-stone-400 hover:text-stone-700'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuTabs;
