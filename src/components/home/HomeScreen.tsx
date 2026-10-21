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
    consumeData,
    triggerDailyRollover,
  } = useTelecom();

  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const t = TRANSLATIONS[language];

  // Top recommended plans
  const recommendedPlans = plans.filter((p) =>
    ['plan-349', 'plan-899', 'plan-500', 'plan-3599'].includes(p.id)
  );

  const trendingPlans = plans.filter((p) =>
    ['plan-399', 'plan-459', 'plan-200', 'plan-1029'].includes(p.id)
  );

  // Calculate percentages
  const dailyRemaining = walletState.dailyQuotaBytes - walletState.dailyUsedBytes;
  const dailyPercent = Math.min(
    100,
    Math.max(0, Math.round((dailyRemaining / walletState.dailyQuotaBytes) * 100))
  );

  if (isLoadingSkeleton) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 bg-slate-200 rounded-3xl md:col-span-2" />
          <div className="h-56 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-28 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Account Summary & Privacy Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {t.prepaidMobile}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {userProfile.accountStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                {isMaskedMobile ? userProfile.maskedMobile : userProfile.mobileNumber}
              </span>
              <button
                onClick={toggleMaskMobile}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
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

        {/* SIM status badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            True 5G Active
          </span>
          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>

      {/* 2. Hero Section: Active Plan Card + Smart Carry Forward Wallet Dial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Active Current Plan Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-900/15 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle wave background graphic */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />

          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  {t.activePlan}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  ₹{activePlan.price}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-200 font-medium">Validity</span>
                <p className="text-base font-bold text-white">24 {t.daysLeft}</p>
              </div>
            </div>

            <p className="text-xs text-blue-100 mt-1 max-w-md line-clamp-1">
              {activePlan.name} · {activePlan.voice}
            </p>
          </div>

          {/* Daily Quota Progress & Details */}
          <div className="my-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-100">Daily Data Quota</span>
              <span className="font-bold text-white tabular-nums">
                {formatBytes(dailyRemaining)} / {formatBytes(walletState.dailyQuotaBytes)} left
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-500"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-blue-200">
              <span>Used: {formatBytes(walletState.dailyUsedBytes)} today</span>
              <span>{t.renewsAt} {walletState.renewalTimeStr}</span>
            </div>
          </div>

          {/* Plan CTA footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigateTab('recharge')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>{t.rechargeNow}</span>
            </button>
            <button
              onClick={() => onNavigateTab('recharge')}
              className="text-xs font-semibold text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewPlans}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Smart Data Wallet / Carry Forward Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Smart Data Wallet
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Unused Data Carry Forward
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                ACTIVE
              </span>
            </div>

            {/* Balances Display */}
            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                  Carry Forward Data
                </span>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-2xl font-black text-blue-900 tabular-nums">
                    {formatBytes(walletState.carryForwardBalanceBytes)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Expires in 3 days
                  </span>
                </div>
              </div>

              {/* Combined Total Available Data */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Available
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                    {formatBytes(walletState.totalEligibleDataBytes)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p>Daily: {formatBytes(dailyRemaining)}</p>
                  <p>Saved: {formatBytes(walletState.carryForwardBalanceBytes)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation shortcuts right on home */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('mydata')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Data Wallet & Ledger</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerDailyRollover()}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Simulate midnight: sweeps unused daily data to carry forward"
            >
              Simulate Rollover
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigateTab('recharge')}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs">{t.rechargeNow}</p>
            <span className="text-[11px] text-slate-500">Prepaid packs</span>
          </button>

          <button
            onClick={() => onNavigateTab('recharge')}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs">Buy 5G Data Pack</p>
            <span className="text-[11px] text-slate-500">Add-on boosters</span>
          </button>

          <button
            onClick={() => onNavigateTab('mydata')}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs">Carry Forward</p>
            <span className="text-[11px] text-slate-500">Saved data rules</span>
          </button>

          <button
            onClick={() => onNavigateTab('history')}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs">{t.dataHistory}</p>
            <span className="text-[11px] text-slate-500">Invoices & ledger</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs">{t.support}</p>
            <span className="text-[11px] text-slate-500">FAQs & Help</span>
          </button>
        </div>
      </div>

      {/* 4. Promotional Banners (Generated 16:9 images) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t.promotions}
          </h3>
          <span className="text-xs text-blue-600 font-semibold cursor-pointer" onClick={() => onNavigateTab('recharge')}>
            View All Offers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 5G Ultra Banner */}
          <div
            onClick={() => onNavigateTab('recharge')}
            className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group cursor-pointer hover:shadow-md transition-all"
          >
            <img
              src="/src/assets/images/promo_true_5g_1792569119252.jpg"
              alt="BlueWave True 5G Ultra High Speed Network"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                True 5G Unlimited
              </span>
              <p className="text-white font-bold text-sm">
                No Daily Data Limits on 5G Network
              </p>
            </div>
          </div>

          {/* Entertainment Suite Banner */}
          <div
            onClick={() => onNavigateTab('recharge')}
            className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group cursor-pointer hover:shadow-md transition-all"
          >
            <img
              src="/src/assets/images/promo_entertainment_suite_1792569119715.jpg"
              alt="BlueWave Cinema and OTT Entertainment"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Entertainment Suite
              </span>
              <p className="text-white font-bold text-sm">
                Disney+ Hotstar, SonyLIV & Netflix Bundled
              </p>
            </div>
          </div>

          {/* Smart Data Wallet Banner */}
          <div
            onClick={() => onNavigateTab('mydata')}
            className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group cursor-pointer hover:shadow-md transition-all"
          >
            <img
              src="/src/assets/images/promo_carry_forward_1792569120227.jpg"
              alt="BlueWave Smart Data Wallet Carry Forward"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Unused Data Carry Forward
              </span>
              <p className="text-white font-bold text-sm">
                Never Waste Your Eligible Daily MBs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recommended Plans Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.recommendedPlans}
            </h3>
            <span className="text-xs text-slate-400 font-medium">· Demo Catalog</span>
          </div>
          <button
            onClick={() => onNavigateTab('recharge')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>See all 16 plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      ₹{plan.price}
                    </span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{plan.name}</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">
                    {plan.validityDays} Days
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">
                    Data: {plan.dailyDataBytes ? `${formatBytes(plan.dailyDataBytes)} / Day` : formatBytes(plan.totalDataBytes || 0)}
                  </p>
                  <p className="text-slate-500">Voice: {plan.voice}</p>
                  {plan.is5GEligible && (
                    <p className="text-blue-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      True 5G Unlimited Included
                    </p>
                  )}
                  {plan.carryForwardEligible && (
                    <p className="text-emerald-600 font-medium">
                      ✓ Smart Data Carry Forward
                    </p>
                  )}
                </div>

                {/* OTT Logos */}
                {plan.ottBenefits.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">OTT:</span>
                    {plan.ottBenefits.map((ott) => (
                      <span
                        key={ott.id}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded"
                      >
                        {ott.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectPlanForCheckout(plan)}
                className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
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
