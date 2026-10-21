/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { RechargePlan } from '../../types/telecom';
import { TRANSLATIONS } from '../../data/translations';
import { formatBytes, ONE_GB } from '../../engine/CarryForwardEngine';
import {
  User,
  Smartphone,
  Globe,
  Radio,
  Shield,
  HelpCircle,
  FileText,
  Plus,
  Edit2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders,
  Check,
  X,
  PhoneCall,
  Wifi,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    userProfile,
    language,
    setLanguage,
    isDemoMode,
    toggleDemoMode,
    switchActiveNumber,
    plans,
    updatePlanAdmin,
    addPlanAdmin,
  } = useTelecom();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'faq' | 'admin'>('profile');
  const [editingPlan, setEditingPlan] = useState<RechargePlan | null>(null);
  const [newPlanModal, setNewPlanModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const faqs = [
    {
      q: 'What is BlueWave Unused Data Carry Forward?',
      a: 'In a traditional telecom plan, your daily allowance (e.g. 2 GB/day) expires at 11:59 PM if not used. BlueWave automatically sweeps any eligible unused MBs into your Smart Data Wallet so you can consume it whenever you need extra data during your billing cycle.',
    },
    {
      q: 'Which recharge plans are eligible for carry forward?',
      a: 'All plans marked with the "Unused Data Carry Forward" badge (such as ₹349, ₹399, ₹459, ₹899, ₹999, ₹1,029, and ₹3,599) include Smart Data Wallet rollover at no extra cost.',
    },
    {
      q: 'How long does carried-forward data remain valid?',
      a: 'Carried-forward data remains active for 7 days from the day it was saved, or until the active base recharge plan reaches its validity expiration, whichever occurs first.',
    },
    {
      q: 'Is this real SIM data or demo simulation?',
      a: 'This application operates in high-fidelity simulated Demo Mode with an authoritative domain engine. Real telecom network-level rollover requires certified API access with licensed telecom carriers.',
    },
  ];

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      updatePlanAdmin(editingPlan);
      setEditingPlan(null);
      setSuccessToast(`Plan ₹${editingPlan.price} updated successfully!`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-600/20">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{userProfile.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {userProfile.mobileNumber} · {userProfile.circle}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {userProfile.simType}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                True 5G Active
              </span>
            </div>
          </div>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile & SIMs
          </button>
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'faq'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carry Forward FAQ
          </button>
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Catalog ({plans.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linked Numbers & Secondary SIMs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Linked Accounts & SIMs</h3>
                <p className="text-xs text-slate-500">Switch active account for recharges</p>
              </div>
              <button
                onClick={() =>
                  alert('To link a new family SIM or Fiber ID, enter OTP sent to registered number.')
                }
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Number</span>
              </button>
            </div>

            <div className="space-y-3">
              {userProfile.linkedNumbers.map((acc) => {
                const isSelected = userProfile.mobileNumber === acc.number;
                return (
                  <div
                    key={acc.number}
                    onClick={() => switchActiveNumber(acc.number)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{acc.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-mono mt-0.5">{acc.number}</p>
                      <span className="text-[11px] text-slate-500 block mt-1">{acc.balance}</span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences & Telecom Mode */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Application & Telecom Preferences
            </h3>

            {/* Language toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Application Language</p>
                  <p className="text-[11px] text-slate-500">English / हिन्दी</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    language === 'hi'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Demo vs Operator Mode */}
            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Telecom Integration Mode</p>
                    <p className="text-[11px] text-slate-500">
                      {isDemoMode ? 'Simulated Sandbox Mode' : 'Live Carrier API Mode'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isDemoMode
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isDemoMode ? 'Demo Sandbox' : 'Operator API'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                In Demo Mode, data balances and recharges simulate carrier behaviors. Operator
                Mode uses authenticated REST endpoints defined in the Android architecture.
              </p>
            </div>

            {/* Support hotline */}
            <div className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">BlueWave Helpline</p>
                  <p className="text-[11px] text-slate-500">Toll Free 1800-889-9999 (24x7)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">Call Now</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Knowledge Base & Terms
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Understanding Smart Carry Forward Data
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'admin' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Admin Plan Configurator
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Manage Live Telecom Plans ({plans.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Modifications apply immediately without app reload
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Plan Name</th>
                  <th className="pb-3">Validity</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">5G</th>
                  <th className="pb-3">Carry Forward</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 font-extrabold text-slate-900 tabular-nums">
                      ₹{p.price}
                    </td>
                    <td className="py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="py-3">{p.validityDays}d</td>
                    <td className="py-3">
                      {p.dailyDataBytes
                        ? `${formatBytes(p.dailyDataBytes)}/day`
                        : formatBytes(p.totalDataBytes || 0)}
                    </td>
                    <td className="py-3">
                      {p.is5GEligible ? (
                        <span className="text-blue-600 font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3">
                      {p.carryForwardEligible ? (
                        <span className="text-emerald-600 font-bold">Enabled</span>
                      ) : (
                        <span className="text-slate-400">Disabled</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setEditingPlan(p)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSavePlanEdit}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Plan: {editingPlan.name}</h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={editingPlan.validityDays}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, validityDays: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.is5GEligible}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, is5GEligible: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>True 5G Eligible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.carryForwardEligible}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, carryForwardEligible: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Carry Forward Eligible</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
