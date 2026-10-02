import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pantryCount?: number;
  shoppingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  pantryCount = 0,
  shoppingCount = 0,
}) => {
  const tabs = [
    {
      id: 'pantry' as TabType,
      emoji: '🧊',
      label: 'ตู้เย็น',
      badge: pantryCount > 0 ? pantryCount : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'recipes' as TabType,
      emoji: '📖',
      label: 'สูตร',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'cookable' as TabType,
      emoji: '🍳',
      label: 'ทำอะไรได้',
      badge: null,
      badgeColor: '',
    },
    {
      id: 'shopping' as TabType,
      emoji: '🛒',
      label: 'ซื้อของ',
      badge: shoppingCount > 0 ? shoppingCount : null,
      badgeColor: 'bg-amber-600 text-white',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg safe-area-inset-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[48px] relative flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-stone-500 hover:text-stone-700 font-medium'
              }`}
            >
              <div className="relative">
                <span className="text-2xl leading-none">{tab.emoji}</span>
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2.5 text-[10px] leading-tight font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-6 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
