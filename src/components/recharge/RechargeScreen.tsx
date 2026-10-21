/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { RechargePlan, PlanCategory } from '../../types/telecom';
import { CATEGORY_DEFINITIONS, FILTER_CHIPS } from '../../data/plansCatalog';
import { formatBytes } from '../../engine/CarryForwardEngine';
import {
  Search,
  Zap,
  Sparkles,
  Info,
  Tv,
  Check,
  CheckCircle2,
  X,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface RechargeScreenProps {
  onSelectPlanForCheckout: (plan: RechargePlan) => void;
}

export const RechargeScreen: React.FC<RechargeScreenProps> = ({
  onSelectPlanForCheckout,
}) => {
  const { plans, userProfile } = useTelecom();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | 'ALL'>('POPULAR');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Plans');
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<RechargePlan | null>(null);

  // Filter plans based on category, filter chip, and search query
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // 1. Category filter
      if (selectedCategory !== 'ALL' && plan.category !== selectedCategory) {
        return false;
      }

      // 2. Chip filter
      if (selectedFilter !== 'All Plans') {
        if (selectedFilter === '1.5 GB/day' && !plan.tags.includes('1.5 GB/day')) return false;
        if (selectedFilter === '2 GB/day' && !plan.tags.includes('2 GB/day')) return false;
        if (selectedFilter === '2.5 GB/day' && !plan.tags.includes('2.5 GB/day')) return false;
        if (selectedFilter === '3 GB/day' && !plan.tags.includes('3 GB/day')) return false;
        if (selectedFilter === '5G Plans' && !plan.is5GEligible) return false;
        if (
          selectedFilter === 'Netflix Plans' &&
          !plan.ottBenefits.some((ott) => ott.name.toLowerCase().includes('netflix'))
        ) {
          return false;
        }
        if (selectedFilter === '28-day plans' && plan.validityDays !== 28) return false;
        if (
          selectedFilter === '84-day plans' &&
          plan.validityDays !== 84 &&
          plan.validityDays !== 90 &&
          plan.validityDays !== 98
        ) {
          return false;
        }
        if (selectedFilter === '365-day plans' && plan.validityDays !== 365) return false;
        if (selectedFilter === 'Carry Forward' && !plan.carryForwardEligible) return false;
      }

      // 3. Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const priceMatch = plan.price.toString().includes(query);
        const nameMatch = plan.name.toLowerCase().includes(query);
        const descMatch = plan.description.toLowerCase().includes(query);
        const tagMatch = plan.tags.some((t) => t.toLowerCase().includes(query));
        const ottMatch = plan.ottBenefits.some((o) => o.name.toLowerCase().includes(query));
        if (!priceMatch && !nameMatch && !descMatch && !tagMatch && !ottMatch) {
          return false;
        }
      }

      return true;
    });
  }, [plans, selectedCategory, selectedFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Target Subscriber Banner with Luxury Obsidian Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Recharging Target SIM</p>
            <p className="text-sm font-black text-white font-mono">
              {userProfile.maskedMobile} <span className="text-slate-500 font-sans font-normal">·</span> <span className="text-cyan-300 font-sans font-bold">{userProfile.circle}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            5G SIM Verified
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-medium">Configurable Carrier Catalog</span>
        </div>
      </div>

      {/* Search Input Bar with Glowing Active Ring */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by price (e.g. 349, 899), daily data (2 GB), validity (84, 365) or OTT (Netflix)..."
          className="w-full pl-12 pr-10 py-3.5 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm text-white placeholder-slate-400 shadow-xl transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs (Single-line horizontal scroll) */}
      <div className="overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_DEFINITIONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
        <div className="flex items-center gap-1.5 min-w-max">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setSelectedFilter(chip)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFilter === chip
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5 hover:bg-slate-800'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Showing {filteredPlans.length} Available Plans
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Demo Pricing · 18% GST Included
          </span>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            <p className="text-base font-extrabold text-white">No plans found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter, search query, or selected tags.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedFilter('All Plans');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Price & Validity */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                          ₹{plan.price}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm mt-0.5">
                        {plan.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black">
                        {plan.validityDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Core Benefits Matrix */}
                  <div className="py-4 space-y-2.5 text-xs">
                    {/* Data */}
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Data Quota</span>
                      <span className="font-black text-white font-mono">
                        {plan.dailyDataBytes
                          ? `${formatBytes(plan.dailyDataBytes)} / Day`
                          : formatBytes(plan.totalDataBytes || 0)}
                        {plan.extraDataBytes ? ` + ${formatBytes(plan.extraDataBytes)} Extra` : ''}
                      </span>
                    </div>

                    {/* Calling */}
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Voice Calls</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                        {plan.voice}
                      </span>
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">SMS</span>
                      <span className="font-semibold text-slate-200">{plan.sms}</span>
                    </div>

                    {/* True 5G */}
                    {plan.is5GEligible && (
                      <div className="flex items-center justify-between text-cyan-300 pt-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          True 5G Unlimited
                        </span>
                        <span className="text-[10px] font-black bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 rounded">
                          ELIGIBLE
                        </span>
                      </div>
                    )}

                    {/* Carry Forward */}
                    {plan.carryForwardEligible && (
                      <div className="flex items-center justify-between text-emerald-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Data Carry Forward
                        </span>
                        <span className="text-[10px] font-black bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded">
                          ACTIVE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* OTT Subscriptions Bundle */}
                  {plan.ottBenefits.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                        Subscriptions Included
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plan.ottBenefits.map((ott) => (
                          <span
                            key={ott.id}
                            className="text-[11px] font-semibold text-slate-200 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                          >
                            <Tv className="w-3 h-3 text-cyan-400" />
                            {ott.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPlanDetail(plan)}
                    className="p-3 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                    title="View Full Plan Details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectPlanForCheckout(plan)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.99] text-white text-xs font-black shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Recharge ₹{plan.price}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Details Modal with Frosted Luxury Glass */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                  Plan Details
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedPlanDetail.name} (₹{selectedPlanDetail.price})
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950/70 rounded-2xl p-4 space-y-2 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">Price</span>
                  <span className="font-black text-white font-mono">₹{selectedPlanDetail.price} (Inclusive of GST)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validity</span>
                  <span className="font-bold text-cyan-300 font-mono">{selectedPlanDetail.validityDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total High-Speed Data</span>
                  <span className="font-bold text-white font-mono">
                    {selectedPlanDetail.dailyDataBytes
                      ? `${formatBytes(selectedPlanDetail.dailyDataBytes * selectedPlanDetail.validityDays)} (${formatBytes(selectedPlanDetail.dailyDataBytes)}/day)`
                      : formatBytes(selectedPlanDetail.totalDataBytes || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Post Quota Speed</span>
                  <span className="font-bold text-white">64 Kbps Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Voice Calling</span>
                  <span className="font-bold text-white">{selectedPlanDetail.voice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SMS Allowance</span>
                  <span className="font-bold text-white">{selectedPlanDetail.sms}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-white mb-1">Description & Terms</h5>
                <p className="text-slate-400 leading-relaxed">{selectedPlanDetail.description}</p>
              </div>

              {selectedPlanDetail.carryForwardEligible && (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-200 text-xs">
                  <span className="font-bold block mb-0.5 text-emerald-300">Smart Data Carry Forward Eligible</span>
                  Unused daily quota from this plan is automatically preserved in your Carry Forward bucket at midnight.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const plan = selectedPlanDetail;
                  setSelectedPlanDetail(null);
                  onSelectPlanForCheckout(plan);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Proceed to Recharge ₹{selectedPlanDetail.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
