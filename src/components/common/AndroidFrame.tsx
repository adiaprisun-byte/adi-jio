/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { Wifi, Signal, BatteryMedium } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const { viewMode, setViewMode } = useTelecom();

  if (viewMode === 'web') {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4 flex flex-col items-center justify-center">
      {/* Device Toolbar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[430px] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-200">Android 15 Device Simulator</span>
        </div>
        <button
          onClick={() => setViewMode('web')}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4 cursor-pointer"
        >
          Switch to Full Web
        </button>
      </div>

      {/* Realistic Smartphone Chassis */}
      <div className="relative w-full max-w-[420px] h-[860px] bg-slate-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-white/10 shadow-blue-900/30 flex flex-col overflow-hidden">
        {/* Outer Phone Rim & Volume/Power Buttons */}
        <div className="absolute -left-1 top-24 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-1 top-40 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-1 top-28 w-1 h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Container */}
        <div className="relative w-full h-full bg-slate-50 rounded-[40px] overflow-hidden flex flex-col border border-slate-800">
          {/* Android Status Bar */}
          <div className="bg-white/95 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-slate-800 select-none z-30 shrink-0">
            <span>12:45</span>
            {/* Camera Punch Hole */}
            <div className="w-4 h-4 rounded-full bg-black mx-auto ring-2 ring-slate-800/40" />
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                5G
              </span>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 overflow-y-auto relative pb-20">
            {children}
          </div>

          {/* Bottom Gesture Navigation Pill */}
          <div className="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center pointer-events-none z-50">
            <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
