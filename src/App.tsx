/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TelecomProvider, useTelecom } from './context/TelecomContext';
import { TopBar } from './components/common/TopBar';
import { BottomNav } from './components/common/BottomNav';
import { AndroidFrame } from './components/common/AndroidFrame';
import { CheckoutModal } from './components/common/CheckoutModal';
import { HomeScreen } from './components/home/HomeScreen';
import { RechargeScreen } from './components/recharge/RechargeScreen';
import { MyDataScreen } from './components/mydata/MyDataScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { AndroidCodeInspector } from './components/android/AndroidCodeInspector';
import { DataMarketScreen } from './components/market/DataMarketScreen';
import { RechargePlan } from './types/telecom';
import { Radio, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<RechargePlan | null>(null);
  const { viewMode } = useTelecom();

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content framed for Web or Android Simulator */}
      <AndroidFrame>
        <main className="flex-1 pb-16 md:pb-8">
          {activeTab === 'home' && (
            <HomeScreen
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectPlanForCheckout={(plan) => setSelectedPlanForCheckout(plan)}
            />
          )}

          {activeTab === 'recharge' && (
            <RechargeScreen
              onSelectPlanForCheckout={(plan) => setSelectedPlanForCheckout(plan)}
            />
          )}

          {activeTab === 'mydata' && (
            <MyDataScreen onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'market' && <DataMarketScreen />}

          {activeTab === 'history' && <HistoryScreen />}

          {activeTab === 'profile' && <ProfileScreen />}

          {activeTab === 'android' && <AndroidCodeInspector />}
        </main>
      </AndroidFrame>

      {/* Checkout Modal Sheet */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          onClose={() => setSelectedPlanForCheckout(null)}
          onRechargeComplete={(tx) => {
            // Can show receipt or stay on active tab
          }}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Luxury Footer */}
      {viewMode === 'web' && (
        <footer className="mt-auto bg-slate-950/80 backdrop-blur-md border-t border-white/10 py-8 px-4 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">BlueWave Signature Telecom</span>
              <span>·</span>
              <span className="text-slate-400">Original Carrier Architecture</span>
              <span>·</span>
              <span className="text-cyan-400 font-medium">Smart Data Wallet & RoamBridge</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>Demo Sandbox Environment</span>
              <span>·</span>
              <span>256-Bit Encrypted Wallet</span>
              <span>·</span>
              <span>Android Jetpack Compose Ready</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TelecomProvider>
      <AppContent />
    </TelecomProvider>
  );
}
