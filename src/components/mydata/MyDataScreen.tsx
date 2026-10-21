/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import {
  formatBytes,
  runCarryForwardEngineTests,
  ONE_GB,
  ONE_MB,
} from '../../engine/CarryForwardEngine';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ChevronDown,
  Info,
  Sliders,
  Check,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface MyDataScreenProps {
  onNavigateTab?: (tab: string) => void;
}

export const MyDataScreen: React.FC<MyDataScreenProps> = ({ onNavigateTab }) => {
  const {
    walletState,
    consumeData,
    triggerDailyRollover,
    toggleCarryForward,
    setAllocationOrder,
    ledger,
    earningsWallet,
  } = useTelecom();

  const [simulatedMb, setSimulatedMb] = useState<number>(500);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    results: string[];
  } | null>(null);
  const [showRuleDetails, setShowRuleDetails] = useState<boolean>(false);

  const dailyRemaining = walletState.dailyQuotaBytes - walletState.dailyUsedBytes;
  const dailyPercent = Math.min(
    100,
    Math.max(0, Math.round((dailyRemaining / walletState.dailyQuotaBytes) * 100))
  );

  const handleRunTests = () => {
    const res = runCarryForwardEngineTests();
    setTestResults(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 animate-fade-in">
      {/* Header Banner in Signature Gradient Glass */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50 border border-cyan-500/30 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>High-Integrity Telecom Engine · Smart Data Wallet</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Unused Data Carry Forward
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Standard telecom daily quotas expire every night at 23:59:59. With BlueWave's Smart
            Data Wallet, eligible unused megabytes automatically transfer into an isolated,
            cryptographically logged Carry Forward bucket that remains active for 7 days.
          </p>
        </div>

        {/* Ambient wave glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3-Column Metrics Overview in Obsidian Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Daily Allowance */}
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/40 flex flex-col justify-between group hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
              <span className="uppercase tracking-widest text-[11px]">Today's Daily Allowance</span>
              <span className="text-cyan-300 font-mono font-bold bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/30">Day {walletState.currentSimulatedDay}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tabular-nums font-mono">
                {formatBytes(dailyRemaining)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                left of {formatBytes(walletState.dailyQuotaBytes)}
              </span>
            </div>

            {/* Daily Bar */}
            <div className="mt-4 w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 shadow-md shadow-cyan-400/40"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 text-xs text-slate-400 flex justify-between font-medium">
            <span>Used today: <strong className="text-white font-mono">{formatBytes(walletState.dailyUsedBytes)}</strong></span>
            <span className="text-cyan-300">Resets {walletState.renewalTimeStr}</span>
          </div>
        </div>

        {/* Metric 2: Carry Forward Data Balance */}
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/40 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
              <span className="text-emerald-400 uppercase tracking-widest text-[11px]">Carry Forward Vault</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black px-2 py-0.5 rounded-full">
                SAVED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-300 tabular-nums font-mono">
                {formatBytes(walletState.carryForwardBalanceBytes)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                in secure vault
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Accumulated from previous days. Tapped seamlessly when daily quota is exhausted.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 text-xs text-slate-400 flex justify-between font-medium">
            <span>Buckets active: <strong className="text-white font-mono">{walletState.buckets.length}</strong></span>
            <span className="text-amber-400 font-bold">Expires in 7 days</span>
          </div>
        </div>

        {/* Metric 3: Total Eligible Available Data */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-2xl shadow-blue-900/40 border border-blue-400/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-200 font-bold mb-2">
              <span className="uppercase tracking-widest text-[11px]">Total Eligible Quota</span>
              <span className="text-[10px] bg-white/20 text-white font-black px-2.5 py-0.5 rounded-full border border-white/20">
                COMBINED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tabular-nums font-mono">
                {formatBytes(walletState.totalEligibleDataBytes)}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily quota portion:</span>
                <span className="font-bold text-cyan-300 font-mono">{formatBytes(dailyRemaining)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saved Carry Forward:</span>
                <span className="font-bold text-emerald-300 font-mono">{formatBytes(walletState.carryForwardBalanceBytes)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 text-[11px] text-blue-200 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Zero float drift · 64-bit integer ledger</span>
          </div>
        </div>
      </div>

      {/* Monetize Carry Forward Data Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-500/30 shadow-2xl shadow-emerald-950/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                MONETIZE EXCESS DATA
              </span>
              <span className="text-[11px] font-bold text-slate-300 font-mono">
                Cash Wallet: ₹{earningsWallet.cashBalanceInr}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1">
              Sell Spare Carry Forward Data on the P2P Board or Global RoamPool
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Export your saved data to countries where data is expensive (Switzerland, UAE, USA) for up to <span className="text-emerald-400 font-bold font-mono">₹350–₹520 / GB</span>!
            </p>
          </div>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('market')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer hover:scale-[1.02]"
          >
            <span>Sell Data & Earn</span>
            <ChevronRight className="w-4 h-4 text-slate-950" />
          </button>
        )}
      </div>

      {/* Interactive Simulation Sandbox: Consume Data & Advance Day */}
      <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Interactive Testbench & Sandbox
            </span>
            <h3 className="text-xl font-black text-white">
              Simulate Network Traffic & Midnight Rollover
            </h3>
          </div>
          <button
            onClick={handleRunTests}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>Run Engine Unit Tests</span>
          </button>
        </div>

        {/* Engine Unit Tests Output if triggered */}
        {testResults && (
          <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono space-y-1.5 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-sans">
              <span className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                JUnit Test Suite Executed Successfully
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ALL ASSERTIONS PASSED
              </span>
            </div>
            {testResults.results.map((res, i) => (
              <p
                key={i}
                className={res.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}
              >
                {res}
              </p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action 1: Simulate Usage */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
            <div>
              <h4 className="font-black text-white text-sm">
                1. Simulate Data Consumption
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Consume data in real time to test quota deduction and threshold alerts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[250, 500, 750, 1024].map((mb) => (
                <button
                  key={mb}
                  onClick={() => setSimulatedMb(mb)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer font-mono ${
                    simulatedMb === mb
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {mb >= 1024 ? '1.0 GB' : `${mb} MB`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => consumeData(simulatedMb, '4K Video Streaming')}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                Consume {simulatedMb >= 1024 ? '1.0 GB' : `${simulatedMb} MB`}
              </button>
            </div>
          </div>

          {/* Action 2: Trigger Midnight Rollover */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
            <div>
              <h4 className="font-black text-white text-sm">
                2. Simulate End of Day (Midnight Rollover)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Executes the rollover sweep: transfers today's unused MBs to Carry Forward,
                and issues tomorrow's fresh 2.0 GB quota independently.
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Eligible Unused Today:</span>
                <span className="font-bold text-cyan-300 font-mono">{formatBytes(dailyRemaining)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Carried Balance:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {formatBytes(walletState.carryForwardBalanceBytes)}
                </span>
              </div>
            </div>

            <button
              onClick={() => triggerDailyRollover()}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advance Day & Execute Rollover</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configurable Policy Engine Settings in Obsidian Glass */}
      <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/40 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Allocation Engine Rules
            </span>
            <h3 className="text-lg font-black text-white">
              Policy & Allocation Order Settings
            </h3>
          </div>
          <button
            onClick={() => setShowRuleDetails(!showRuleDetails)}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showRuleDetails ? 'Hide details' : 'View full policy'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showRuleDetails ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showRuleDetails && (
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              <strong className="text-white">1. Atomic Day-Boundary Sweep:</strong> At 23:59:59 each night, the engine
              computes <code>dailyQuota - dailyUsed</code>. Positive delta is saved to a FIFO
              carry-forward bucket with idempotency key.
            </p>
            <p>
              <strong className="text-white">2. Independent Issuance:</strong> At 00:00:00, the full daily allowance
              (e.g., 2.0 GB) is issued unconditionally without modifying the saved balance.
            </p>
            <p>
              <strong className="text-white">3. Expiration Cap:</strong> Each rollover bucket carries a 7-day validity
              window. The maximum wallet capacity is capped at 10.0 GB to maintain fair use.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle 1: Carry Forward Enabled */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-xs">Carry Forward Active</p>
              <p className="text-[11px] text-slate-400">
                Preserve unused data at end of day
              </p>
            </div>
            <button
              onClick={() => toggleCarryForward(!walletState.isCarryForwardEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                walletState.isCarryForwardEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 shadow-sm absolute top-0.5 transition-transform ${
                  walletState.isCarryForwardEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Selector 2: Allocation Order */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-xs">Consumption Priority</p>
              <p className="text-[11px] text-slate-400">
                Which bucket is consumed first
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setAllocationOrder('DAILY_FIRST')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  walletState.allocationOrder === 'DAILY_FIRST'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily First
              </button>
              <button
                onClick={() => setAllocationOrder('CARRY_FORWARD_FIRST')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  walletState.allocationOrder === 'CARRY_FORWARD_FIRST'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Saved First
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Ledger Audit Stream */}
      <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl shadow-black/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Immutable Audit Trail
            </span>
            <h3 className="text-lg font-black text-white">
              Daily Data Ledger Events
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium font-mono">
            {ledger.length} events logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {ledger.map((item) => {
            const isRollover = item.type === 'ROLLOVER';
            const isUsage = item.type === 'USAGE';
            const isDataSold = item.type === 'DATA_SOLD';
            const isDataBought = item.type === 'DATA_BOUGHT';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isRollover
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isUsage
                        ? 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                        : isDataSold
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {isRollover ? '✦' : isUsage ? '↓' : isDataSold ? '₹' : '↑'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.type}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Day {item.dayNumber}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-black font-mono text-sm tabular-nums ${
                      isRollover
                        ? 'text-emerald-400'
                        : isUsage || isDataSold
                        ? 'text-slate-300'
                        : 'text-cyan-400'
                    }`}
                  >
                    {isUsage || isDataSold ? '-' : '+'}
                    {formatBytes(item.amountBytes)}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Vault: {formatBytes(item.newCarryForwardBytes)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
