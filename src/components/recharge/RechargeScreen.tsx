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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Target Subscriber Banner */}
      <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Recharging for</p>
            <p className="text-sm font-bold text-slate-900">
              {userProfile.maskedMobile} · {userProfile.circle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-emerald-600">✓ 5G SIM Detected</span>
          <span>·</span>
          <span>Configurable Sample Catalog</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by price (e.g. 349, 899), data quota (2 GB), validity or OTT (Netflix)..."
          className="w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
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
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORY_DEFINITIONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFilter === chip
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredPlans.length} Available Plans
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Demo Pricing · 18% GST Included
          </span>
        </div>

        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-base font-bold text-slate-800">No plans found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter, search query, or selected tags.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedFilter('All Plans');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Price & Validity */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900 tabular-nums">
                          ₹{plan.price}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                        {plan.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                        {plan.validityDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Core Benefits Matrix */}
                  <div className="py-4 space-y-2.5 text-xs">
                    {/* Data */}
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">Data Quota</span>
                      <span className="font-bold text-slate-900">
                        {plan.dailyDataBytes
                          ? `${formatBytes(plan.dailyDataBytes)} / Day`
                          : formatBytes(plan.totalDataBytes || 0)}
                        {plan.extraDataBytes ? ` + ${formatBytes(plan.extraDataBytes)} Extra` : ''}
                      </span>
                    </div>

                    {/* Calling */}
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">Voice Calls</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {plan.voice}
                      </span>
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500">SMS</span>
                      <span className="font-semibold text-slate-800">{plan.sms}</span>
                    </div>

                    {/* True 5G */}
                    {plan.is5GEligible && (
                      <div className="flex items-center justify-between text-blue-700 pt-1">
                        <span className="font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          True 5G Unlimited
                        </span>
                        <span className="text-[11px] font-bold bg-blue-100/60 px-2 py-0.5 rounded">
                          ELIGIBLE
                        </span>
                      </div>
                    )}

                    {/* Carry Forward */}
                    {plan.carryForwardEligible && (
                      <div className="flex items-center justify-between text-emerald-700">
                        <span className="font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Unused Data Carry Forward
                        </span>
                        <span className="text-[11px] font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                          ACTIVE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* OTT Subscriptions Bundle */}
                  {plan.ottBenefits.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Subscriptions Included
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {plan.ottBenefits.map((ott) => (
                          <span
                            key={ott.id}
                            className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Tv className="w-3 h-3 text-blue-600" />
                            {ott.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPlanDetail(plan)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                    title="View Full Plan Details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectPlanForCheckout(plan)}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Recharge ₹{plan.price}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Plan Details
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedPlanDetail.name} (₹{selectedPlanDetail.price})
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Price</span>
                  <span className="font-bold text-slate-900">₹{selectedPlanDetail.price} (Inclusive of GST)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity</span>
                  <span className="font-bold text-slate-900">{selectedPlanDetail.validityDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total High-Speed Data</span>
                  <span className="font-bold text-slate-900">
                    {selectedPlanDetail.dailyDataBytes
                      ? `${formatBytes(selectedPlanDetail.dailyDataBytes * selectedPlanDetail.validityDays)} (${formatBytes(selectedPlanDetail.dailyDataBytes)}/day)`
                      : formatBytes(selectedPlanDetail.totalDataBytes || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Post Quota Speed</span>
                  <span className="font-bold text-slate-900">64 Kbps Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Voice Calling</span>
                  <span className="font-bold text-slate-900">{selectedPlanDetail.voice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SMS Allowance</span>
                  <span className="font-bold text-slate-900">{selectedPlanDetail.sms}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">Description & Terms</h5>
                <p className="text-slate-600 leading-relaxed">{selectedPlanDetail.description}</p>
              </div>

              {selectedPlanDetail.carryForwardEligible && (
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs">
                  <span className="font-bold block mb-0.5">Smart Data Carry Forward Eligible</span>
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
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
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
