/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  Home,
  Zap,
  Wallet,
  Globe2,
  Clock,
  User,
  Code2,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { language } = useTelecom();
  const t = TRANSLATIONS[language];

  const items = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'recharge', label: t.recharge, icon: Zap },
    { id: 'mydata', label: t.myData, icon: Wallet },
    { id: 'market', label: 'Trade', icon: Globe2 },
    { id: 'history', label: t.history, icon: Clock },
    { id: 'profile', label: t.profile, icon: User },
    { id: 'android', label: 'Android', icon: Code2 },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-black/80 pb-safe"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-7 items-center h-16 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4] text-cyan-400' : 'stroke-[1.8]'
                  }`}
                />
                {item.id === 'mydata' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[56px] ${
                  isActive ? 'font-black text-cyan-300' : 'font-medium text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
