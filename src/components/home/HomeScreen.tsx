/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { TRANSLATIONS } from '../../data/translations';
import { formatBytes, ONE_GB, ONE_MB } from '../../engine/CarryForwardEngine';
import { RechargePlan } from '../../types/telecom';
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Tv,
  Film,
  Music,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Radio,
  Globe2,
  Wallet,
  ArrowUpRight,
  DollarSign,
  Crown,
  Coins,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigateTab: (tab: string) => void;
  onSelectPlanForCheckout: (plan: RechargePlan) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onSelectPlanForCheckout,
}) => {
  const {
    userProfile,
    activePlan,
    walletState,
    plans,
    language,
    isMaskedMobile,
    toggleMaskMobile,
    triggerDailyRollover,
    profileWallet,
    earningsWallet,
  } = useTelecom();

  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const t = TRANSLATIONS[language];

  // Top recommended plans
  const recommendedPlans = plans.filter((p) =>
    ['plan-349', 'plan-899', 'plan-500', 'plan-3599'].includes(p.id)
  );

  // Calculate percentages
  const dailyRemaining = walletState.dailyQuotaBytes - walletState.dailyUsedBytes;
  const dailyPercent = Math.min(
    100,
    Math.max(0, Math.round((dailyRemaining / walletState.dailyQuotaBytes) * 100))
  );

  const availableSellableBytes = walletState.carryForwardBalanceBytes + walletState.dailyRemainingBytes;
  const availableSellableGb = (availableSellableBytes / ONE_GB).toFixed(1);

  if (isLoadingSkeleton) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900/60 rounded-3xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 bg-slate-900/60 rounded-3xl border border-white/5 md:col-span-2" />
          <div className="h-56 bg-slate-900/60 rounded-3xl border border-white/5" />
        </div>
        <div className="h-28 bg-slate-900/60 rounded-3xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 animate-fade-in">
      {/* 1. Account Identity & Luxury Status Bar */}
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-600/30 border border-white/20">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">
                {t.prepaidMobile}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {userProfile.accountStatus}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3 text-amber-400" />
                VIP Diamond
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-lg font-black text-white tracking-tight font-mono">
                {isMaskedMobile ? userProfile.maskedMobile : userProfile.mobileNumber}
              </span>
              <button
                onClick={toggleMaskMobile}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title={isMaskedMobile ? 'Show full number' : 'Hide number'}
              >
                {isMaskedMobile ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right badges & quick wallet glance */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Quick Wallet preview pill */}
          <button
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all cursor-pointer group"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Wallet:</span>
            <span className="text-white font-mono font-black">
              ₹{profileWallet.cashBalanceInr + profileWallet.telecomCreditBalanceInr}
            </span>
          </button>

          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            True 5G Active
          </span>

          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-2xl transition-colors cursor-pointer"
          >
            Accounts
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Active Current Plan Card + Smart Carry Forward Wallet Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Active Current Plan Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-blue-950/60 border border-blue-400/20 flex flex-col justify-between relative overflow-hidden group">
          {/* Glowing Ambient Radial Glow */}
          <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-cyan-500/15 pointer-events-none blur-3xl group-hover:bg-cyan-500/25 transition-all duration-700" />
          <div className="absolute -left-16 -top-16 w-60 h-60 rounded-full bg-blue-500/15 pointer-events-none blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-full mb-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {t.activePlan}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
                  ₹{activePlan.price}
                </h3>
              </div>
              <div className="text-right bg-white/5 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 font-medium block">Pack Validity</span>
                <p className="text-base font-black text-cyan-300">24 {t.daysLeft}</p>
              </div>
            </div>

            <p className="text-xs text-blue-100 font-medium mt-2 max-w-md line-clamp-1">
              {activePlan.name} · {activePlan.voice} · {activePlan.sms}
            </p>
          </div>

          {/* Daily Quota Progress & Details */}
          <div className="my-6 bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-200 uppercase tracking-wider text-[11px]">
                Today's Daily Quota
              </span>
              <span className="font-extrabold text-white tabular-nums font-mono">
                <span className="text-cyan-300">{formatBytes(dailyRemaining)}</span> / {formatBytes(walletState.dailyQuotaBytes)} left
              </span>
            </div>

            {/* Glowing High-Tech Progress Bar */}
            <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 rounded-full transition-all duration-500 shadow-lg shadow-cyan-400/50"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>Consumed today: <strong className="text-white font-mono">{formatBytes(walletState.dailyUsedBytes)}</strong></span>
              <span className="text-cyan-300 font-semibold">{t.renewsAt} {walletState.renewalTimeStr}</span>
            </div>
          </div>

          {/* Plan CTA footer */}
          <div className="flex items-center justify-between pt-2 relative z-10">
            <button
              onClick={() => onNavigateTab('recharge')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-400/30 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{t.rechargeNow}</span>
            </button>
            <button
              onClick={() => onNavigateTab('recharge')}
              className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{t.viewPlans}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Smart Data Wallet / Carry Forward Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm tracking-tight">
                    Smart Data Wallet
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Unused Daily Data Carry Forward
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>

            {/* Balances Display */}
            <div className="mt-5 space-y-3.5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900/80 border border-blue-500/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                    Carry Forward Balance
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                    Safe Vault
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-3xl font-black text-white tabular-nums font-mono">
                    {formatBytes(walletState.carryForwardBalanceBytes)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Valid 7 days
                  </span>
                </div>
              </div>

              {/* Combined Total Available Data */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Eligible Data
                  </span>
                  <p className="text-xl font-black text-white tabular-nums font-mono mt-0.5">
                    {formatBytes(walletState.totalEligibleDataBytes)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-300 space-y-0.5 font-medium">
                  <p>Daily Quota: <strong className="text-cyan-300 font-mono">{formatBytes(dailyRemaining)}</strong></p>
                  <p>Saved Vault: <strong className="text-emerald-300 font-mono">{formatBytes(walletState.carryForwardBalanceBytes)}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation shortcuts right on home */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('mydata')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Wallet & Ledger</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerDailyRollover()}
              className="text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 shadow-sm"
              title="Simulate midnight: sweeps unused daily data to carry forward"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Midnight Sweep</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. High-Yield Data Monetization Spotlight: Sell Data & Global RoamBridge */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-7 border border-cyan-500/30 shadow-2xl shadow-blue-950/50 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black tracking-widest uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
                MONETIZE YOUR SURPLUS DATA
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" />
                Live Arbitrage Yields
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Sell Excess Data Locally or Export to High-Cost Countries
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect peer-to-peer to sell spare data for fast cash, or export unused MBs to countries like <strong className="text-white">Switzerland, USA, UAE & Germany</strong> where mobile data costs $10–$20/GB. Earn up to <span className="text-emerald-400 font-bold font-mono">₹350–₹520 per GB</span> directly into your BlueWave Wallet!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-center w-full sm:w-auto">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Available to Monetize
              </span>
              <span className="text-xl font-black text-cyan-300 font-mono">
                {availableSellableGb} GB
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('market')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <TrendingUp className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Start Selling & Earning</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Luxury Quick Actions Grid */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>Quick Actions</span>
          <span className="h-px flex-1 bg-white/10" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <button
            onClick={() => onNavigateTab('recharge')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all border border-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">{t.rechargeNow}</p>
            <span className="text-[11px] text-slate-400">Prepaid packs</span>
          </button>

          <button
            onClick={() => onNavigateTab('market')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">Sell Data & Earn</p>
            <span className="text-[11px] text-emerald-400 font-bold">P2P & Global Roam</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all border border-amber-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">Cash Wallet</p>
            <span className="text-[11px] text-amber-300 font-mono font-bold">
              ₹{profileWallet.cashBalanceInr} Cash
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('mydata')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">Carry Forward</p>
            <span className="text-[11px] text-slate-400">Saved data rules</span>
          </button>

          <button
            onClick={() => onNavigateTab('history')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all border border-purple-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">{t.dataHistory}</p>
            <span className="text-[11px] text-slate-400">Invoices & ledger</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-slate-700 group-hover:text-white transition-all border border-white/10">
              <HelpCircle className="w-5 h-5" />
            </div>
            <p className="font-extrabold text-white text-xs">{t.support}</p>
            <span className="text-[11px] text-slate-400">FAQs & Help</span>
          </button>
        </div>
      </div>

      {/* 5. Promotional Banners (Generated 16:9 images with luxury frames) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span>{t.promotions}</span>
            <span className="h-px flex-1 bg-white/10" />
          </h3>
          <span
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
            onClick={() => onNavigateTab('recharge')}
          >
            View All Offers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 5G Ultra Banner */}
          <div
            onClick={() => onNavigateTab('recharge')}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group cursor-pointer hover:border-cyan-500/40 transition-all"
          >
            <img
              src="/src/assets/images/promo_true_5g_1792569119252.jpg"
              alt="BlueWave True 5G Ultra High Speed Network"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded w-fit border border-cyan-500/30">
                True 5G Unlimited
              </span>
              <p className="text-white font-black text-sm mt-1">
                Zero Daily Quota Cap on 5G Standalone
              </p>
            </div>
          </div>

          {/* Entertainment Suite Banner */}
          <div
            onClick={() => onNavigateTab('recharge')}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group cursor-pointer hover:border-purple-500/40 transition-all"
          >
            <img
              src="/src/assets/images/promo_entertainment_suite_1792569119715.jpg"
              alt="BlueWave Cinema and OTT Entertainment"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest bg-purple-950/80 px-2 py-0.5 rounded w-fit border border-purple-500/30">
                Signature Cinema Suite
              </span>
              <p className="text-white font-black text-sm mt-1">
                Disney+ Hotstar, SonyLIV & Netflix Bundled
              </p>
            </div>
          </div>

          {/* Smart Data Wallet Banner */}
          <div
            onClick={() => onNavigateTab('mydata')}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group cursor-pointer hover:border-amber-500/40 transition-all"
          >
            <img
              src="/src/assets/images/promo_carry_forward_1792569120227.jpg"
              alt="BlueWave Smart Data Wallet Carry Forward"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded w-fit border border-amber-500/30">
                Smart Data Wallet
              </span>
              <p className="text-white font-black text-sm mt-1">
                Preserve Every MB of Unused Daily Quota
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recommended Plans with Luxury Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {t.recommendedPlans}
            </h3>
            <span className="text-xs text-slate-500 font-medium">· Configured Plans</span>
          </div>
          <button
            onClick={() => onNavigateTab('recharge')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>See all 16 plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                      ₹{plan.price}
                    </span>
                    <p className="text-xs font-bold text-slate-300 mt-1">{plan.name}</p>
                  </div>
                  <span className="text-xs font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
                    {plan.validityDays} Days
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <p className="font-bold text-white flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Data:</span>
                    <span className="text-cyan-300 font-mono">
                      {plan.dailyDataBytes ? `${formatBytes(plan.dailyDataBytes)} / Day` : formatBytes(plan.totalDataBytes || 0)}
                    </span>
                  </p>
                  <p className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 font-medium">Voice:</span>
                    <span className="text-white font-medium">{plan.voice}</span>
                  </p>
                  {plan.is5GEligible && (
                    <p className="text-cyan-300 font-bold flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      True 5G Unlimited Included
                    </p>
                  )}
                  {plan.carryForwardEligible && (
                    <p className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Smart Data Carry Forward
                    </p>
                  )}
                </div>

                {/* OTT Logos */}
                {plan.ottBenefits.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">OTT:</span>
                    {plan.ottBenefits.map((ott) => (
                      <span
                        key={ott.id}
                        className="text-[10px] font-bold text-slate-200 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg"
                      >
                        {ott.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectPlanForCheckout(plan)}
                className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-600/20 transition-all cursor-pointer group-hover:scale-[1.02]"
              >
                Recharge ₹{plan.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
