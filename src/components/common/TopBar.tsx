/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { TRANSLATIONS } from '../../data/translations';
import {
  Bell,
  Smartphone,
  Globe,
  Radio,
  CheckCircle2,
  X,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, setActiveTab }) => {
  const {
    unreadCount,
    notifications,
    markNotificationsRead,
    dismissNotification,
    language,
    setLanguage,
    viewMode,
    setViewMode,
    isDemoMode,
    toggleDemoMode,
  } = useTelecom();

  const [showNotifications, setShowNotifications] = useState(false);
  const t = TRANSLATIONS[language];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'recharge', label: t.recharge },
    { id: 'mydata', label: t.myData },
    { id: 'history', label: t.history },
    { id: 'profile', label: t.profile },
  ];

  return (
    <>
      {/* Top Banner Notice: Telecom Mode */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-2xl truncate">
          <span className="inline-flex items-center gap-1.5 font-medium text-blue-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            {isDemoMode ? t.demoModeNotice : t.operatorModeNotice}
          </span>
          <span className="hidden md:inline text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400">
            Smart Data Wallet · Unused Daily Quota Carry Forward Enabled
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Viewport switch: Web vs Android Mobile Simulator */}
          <button
            onClick={() => setViewMode(viewMode === 'web' ? 'mobile_simulator' : 'web')}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle between responsive web layout and Android phone simulator"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              {viewMode === 'web' ? 'Android Device Simulator' : 'Full Web Portal'}
            </span>
          </button>

          {/* Android Code Project shortcut */}
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Android Studio Source</span>
          </button>
        </div>
      </div>

      {/* Main Header strictly adhering to Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single text element wordmark with wave glyph) */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M2 12c2.5-4 5.5-4 8 0s5.5 4 8 0 4-2 4-2" />
                <path d="M2 16c2.5-4 5.5-4 8 0s5.5 4 8 0 4-2 4-2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-blue-900 leading-none">
                BlueWave<span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Telecom 5G
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action area (Notifications, Language & Quick Action) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Switch language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    markNotificationsRead();
                  }
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Notifications</span>
                      <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications right now
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs relative group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              {notif.title}
                            </span>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-2 block">
                            Just now · BlueWave Network
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Primary CTA: Recharge */}
            <button
              onClick={() => setActiveTab('recharge')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.rechargeNow}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
