/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { RechargePlan } from '../../types/telecom';
import { TRANSLATIONS } from '../../data/translations';
import { formatBytes, ONE_GB } from '../../engine/CarryForwardEngine';
import confetti from 'canvas-confetti';
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
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Zap,
  Lock,
  Building,
  RefreshCw,
  Crown,
  Coins,
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
    profileWallet,
    topUpProfileWallet,
    withdrawEarningsToUPI,
    toggleAutoRecharge,
  } = useTelecom();

  const [activeSubTab, setActiveSubTab] = useState<'wallet' | 'profile' | 'faq' | 'admin'>('wallet');
  const [editingPlan, setEditingPlan] = useState<RechargePlan | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [topUpProcessing, setTopUpProcessing] = useState(false);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(profileWallet.cashBalanceInr);
  const [withdrawUpiVpa, setWithdrawUpiVpa] = useState<string>(profileWallet.linkedUpiVpa);
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);

  const t = TRANSLATIONS[language];

  const totalWalletBalance = profileWallet.cashBalanceInr + profileWallet.telecomCreditBalanceInr;

  const faqs = [
    {
      q: 'What is BlueWave Unused Data Carry Forward?',
      a: 'In a traditional telecom plan, your daily allowance (e.g. 2 GB/day) expires at 11:59 PM if not used. BlueWave automatically sweeps any eligible unused MBs into your Smart Data Wallet so you can consume it whenever you need extra data during your billing cycle.',
    },
    {
      q: 'How does the BlueWave Cash & Telecom Wallet work?',
      a: 'Your wallet has two balances: 1) Cash Earnings: Earned by selling unused data P2P or exporting data to high-cost countries. This can be withdrawn directly to your bank account via UPI. 2) Recharge Credits: Can be used to pay for plan renewals with 1-click or automated auto-recharge.',
    },
    {
      q: 'How do I earn money selling data to other countries?',
      a: 'In countries like Switzerland, UAE, USA, and Germany, mobile data costs $10–$20 per GB. Through BlueWave Global RoamBridge, your surplus carry-forward data is matched to international roamers and tourists, paying you up to ₹350–₹520 per GB directly into your wallet.',
    },
    {
      q: 'Which recharge plans are eligible for carry forward?',
      a: 'All plans marked with the "Unused Data Carry Forward" badge (such as ₹349, ₹399, ₹459, ₹899, ₹999, ₹1,029, and ₹3,599) include Smart Data Wallet rollover at no extra cost.',
    },
    {
      q: 'How long does carried-forward data remain valid?',
      a: 'Carried-forward data remains active for 7 days from the day it was saved, or until the active base recharge plan reaches its validity expiration, whichever occurs first.',
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

  const handleExecuteTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopUpProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const res = topUpProfileWallet(topUpAmount, topUpPaymentMethod);
    setTopUpProcessing(false);
    if (res.success) {
      setShowTopUpModal(false);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0066FF', '#10B981'],
      });
      setSuccessToast(`₹${topUpAmount} added to your BlueWave Wallet!`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const res = withdrawEarningsToUPI(withdrawAmount, withdrawUpiVpa);
    setWithdrawProcessing(false);
    if (res.success) {
      setShowWithdrawModal(false);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399'],
      });
      setSuccessToast(`₹${withdrawAmount} sent to ${withdrawUpiVpa} via Instant UPI!`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 animate-fade-in">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-500/20 backdrop-blur-xl text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-400/50 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-200">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Luxury Member Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
              {userProfile.name.charAt(0)}
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow-sm">
              <Crown className="w-3 h-3 fill-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">{userProfile.name}</h2>
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                SIGNATURE DIAMOND
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              {userProfile.mobileNumber} <span className="text-slate-500 font-sans">·</span> <span className="text-cyan-300 font-sans font-bold">{userProfile.circle}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                {userProfile.simType}
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                True 5G Active
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-fit self-start md:self-auto relative z-10 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveSubTab('wallet')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'wallet'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet & Balance</span>
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SIMs & Settings</span>
          </button>
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'faq'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </button>
          <button
            onClick={() => setActiveSubTab('admin')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'admin'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Catalog ({plans.length})</span>
          </button>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1. SUBTAB: WALLET IN PROFILE */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6">
          {/* Virtual Luxury Telecom Card Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Holographic Virtual Platinum Card (7 cols) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl shadow-blue-950/60 relative overflow-hidden flex flex-col justify-between group">
              {/* Card Holographic Watermark / Waves */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-md">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-xs font-black tracking-widest uppercase text-cyan-300">
                        BlueWave Signature Wallet
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">Fintech & Closed-Loop Telecom Account</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono tracking-widest text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
                    256-BIT ENCRYPTED
                  </span>
                </div>

                {/* Balance display */}
                <div className="mt-8">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                    Total Available Balance
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums tracking-tight">
                      ₹{totalWalletBalance}.00
                    </span>
                  </div>
                </div>

                {/* Dual Sub-Balances */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Cash Earnings (Withdrawable)
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-0.5 block">
                      ₹{profileWallet.cashBalanceInr}.00
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block mt-1 font-medium">
                      From Local P2P & Global Data Sales
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Recharge Credits & Bonus
                    </span>
                    <span className="text-2xl font-black text-cyan-300 font-mono tabular-nums mt-0.5 block">
                      ₹{profileWallet.telecomCreditBalanceInr}.00
                    </span>
                    <span className="text-[10px] text-cyan-300/80 block mt-1 font-medium">
                      Auto-discount for recharge packs
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-6 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
                <div className="flex items-center gap-2 text-slate-300 font-mono">
                  <span className="text-slate-400">Linked UPI:</span>
                  <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{profileWallet.linkedUpiVpa}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black transition-all shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Money</span>
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawAmount(profileWallet.cashBalanceInr);
                      setShowWithdrawModal(true);
                    }}
                    disabled={profileWallet.cashBalanceInr <= 0}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 text-emerald-300 font-black transition-all border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Withdraw Cash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Wallet Automation & Settings (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/40 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-black text-white text-base pb-3 border-b border-white/10 flex items-center justify-between">
                  <span>Wallet Automation</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </h3>

                <div className="space-y-4 mt-4">
                  {/* Auto-Recharge Switch */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-xs">Auto-Recharge from Wallet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automatically renews plan on expiry if wallet has sufficient funds
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAutoRecharge(!profileWallet.autoRechargeEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        profileWallet.autoRechargeEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-slate-950 shadow-sm absolute top-0.5 transition-transform ${
                          profileWallet.autoRechargeEnabled ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 1-Click Recharge Discounting */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Recharge Discount Mode</span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                        ENABLED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When buying ₹349 or ₹899 plans, your ₹{profileWallet.telecomCreditBalanceInr} credits
                      will be applied as an instant checkout deduction.
                    </p>
                  </div>

                  {/* Linked Bank VPA */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Default Settlement VPA
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {profileWallet.linkedUpiVpa}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>NPCI UPI Rails · Regulated Telecom Closed-Loop Wallet</span>
              </div>
            </div>
          </div>

          {/* Wallet Statement / Passbook */}
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                  Passbook & Statements
                </span>
                <h3 className="text-lg font-black text-white">Wallet Transaction History</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {profileWallet.transactions.length} entries recorded
              </span>
            </div>

            <div className="space-y-3">
              {profileWallet.transactions.map((tx) => {
                const isDeposit = tx.type === 'TOPUP' || tx.type === 'CASHBACK' || tx.type === 'GLOBAL_EXPORT' || tx.type === 'DATA_SALE';
                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs transition-all hover:border-white/20"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isDeposit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isDeposit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.description}</span>
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ref: <span className="font-mono text-cyan-300">{tx.referenceId}</span> ·{' '}
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black font-mono text-sm tabular-nums ${
                          isDeposit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isDeposit ? `+₹${tx.amountInr}` : `-₹${tx.amountInr}`}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Wallet Settlement</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBTAB: SUBSCRIBER PROFILE & SIMs */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linked Numbers & Secondary SIMs */}
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-black text-white text-sm">Linked Accounts & SIMs</h3>
                <p className="text-xs text-slate-400">Switch active account for recharges</p>
              </div>
              <button
                onClick={() =>
                  alert('To link a new family SIM or Fiber ID, enter OTP sent to registered number.')
                }
                className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
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
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'border-white/10 hover:border-white/20 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{acc.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{acc.number}</p>
                      <span className="text-[11px] text-slate-300 block mt-1 font-medium">{acc.balance}</span>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences & Telecom Mode */}
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/40 space-y-4">
            <h3 className="font-black text-white text-sm pb-3 border-b border-white/10">
              Application & Telecom Preferences
            </h3>

            {/* Language toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-white/10">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="font-bold text-white text-xs">Application Language</p>
                  <p className="text-[11px] text-slate-400">English / हिन्दी</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    language === 'hi'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Demo vs Operator Mode */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-bold text-white text-xs">Telecom Integration Mode</p>
                    <p className="text-[11px] text-slate-400">
                      {isDemoMode ? 'Simulated Sandbox Mode' : 'Live Carrier API Mode'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    isDemoMode
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'bg-emerald-500 text-slate-950 font-black'
                  }`}
                >
                  {isDemoMode ? 'Demo Sandbox' : 'Operator API'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In Demo Mode, data balances and recharges simulate carrier behaviors. Operator
                Mode uses authenticated REST endpoints defined in the Android architecture.
              </p>
            </div>

            {/* Support hotline */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-bold text-white text-xs">BlueWave Helpline</p>
                  <p className="text-[11px] text-slate-400">Toll Free 1800-889-9999 (24x7)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-400 cursor-pointer">Call Now</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: CARRY FORWARD FAQ */}
      {activeSubTab === 'faq' && (
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/40 space-y-6">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Knowledge Base & Terms
            </span>
            <h3 className="text-xl font-black text-white">
              Understanding Smart Carry Forward Data & Wallets
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-1.5">
                <h4 className="font-bold text-white text-sm">{faq.q}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUBTAB: ADMIN PLAN CONFIGURATOR */}
      {activeSubTab === 'admin' && (
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/40 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                Admin Plan Configurator
              </span>
              <h3 className="text-xl font-black text-white">
                Manage Live Telecom Plans ({plans.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Modifications apply immediately without app reload
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Plan Name</th>
                  <th className="pb-3">Validity</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">5G</th>
                  <th className="pb-3">Carry Forward</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-black text-white font-mono tabular-nums">
                      ₹{p.price}
                    </td>
                    <td className="py-3 font-bold text-slate-200">{p.name}</td>
                    <td className="py-3 font-mono">{p.validityDays}d</td>
                    <td className="py-3 font-mono">
                      {p.dailyDataBytes
                        ? `${formatBytes(p.dailyDataBytes)}/day`
                        : formatBytes(p.totalDataBytes || 0)}
                    </td>
                    <td className="py-3">
                      {p.is5GEligible ? (
                        <span className="text-cyan-400 font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3">
                      {p.carryForwardEligible ? (
                        <span className="text-emerald-400 font-bold">Enabled</span>
                      ) : (
                        <span className="text-slate-500">Disabled</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setEditingPlan(p)}
                        className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer transition-colors"
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

      {/* MODAL: Quick Top-Up Wallet */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleExecuteTopUp}
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Wallet Refill
                </span>
                <h3 className="text-lg font-black text-white">Add Money to Wallet</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-2">Select Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 px-3 rounded-xl font-mono font-bold border transition-all cursor-pointer ${
                        topUpAmount === amt
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Custom Amount (₹)</label>
                <input
                  type="number"
                  min={10}
                  max={50000}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-sm font-bold text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CARD', 'NET_BANKING'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTopUpPaymentMethod(mode)}
                      className={`py-2 px-3 rounded-xl font-bold border text-center transition-all cursor-pointer ${
                        topUpPaymentMethod === mode
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={topUpProcessing || topUpAmount <= 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {topUpProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Top-Up...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Top-Up ₹{topUpAmount} Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Instant Cash Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleExecuteWithdrawal}
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Direct Bank Transfer
                </span>
                <h3 className="text-lg font-black text-white">Withdraw Cash to UPI</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">UPI Address (VPA)</label>
                <input
                  type="text"
                  required
                  value={withdrawUpiVpa}
                  onChange={(e) => setWithdrawUpiVpa(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-300">Withdrawal Amount (₹)</label>
                  <span className="text-slate-400 font-mono">
                    Max: ₹{profileWallet.cashBalanceInr}
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={profileWallet.cashBalanceInr}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-sm font-bold text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-slate-950/70 rounded-xl text-[11px] text-slate-400 border border-white/10">
                Disbursed 24x7 through NPCI IMPS / UPI rails. Zero fees or deductions.
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={withdrawProcessing || withdrawAmount <= 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {withdrawProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Disbursing to Bank...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4 text-slate-950" />
                    <span>Withdraw ₹{withdrawAmount} to UPI</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSavePlanEdit}
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-white text-base">Edit Plan: {editingPlan.name}</h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                  }
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={editingPlan.validityDays}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, validityDays: Number(e.target.value) })
                  }
                  className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingPlan.is5GEligible}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, is5GEligible: e.target.checked })
                    }
                    className="rounded text-cyan-400"
                  />
                  <span>True 5G Eligible</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingPlan.carryForwardEligible}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, carryForwardEligible: e.target.checked })
                    }
                    className="rounded text-emerald-400"
                  />
                  <span>Carry Forward Eligible</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black cursor-pointer shadow-md"
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
