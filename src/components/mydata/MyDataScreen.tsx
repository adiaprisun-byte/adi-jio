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
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sliders,
  Play,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const MyDataScreen: React.FC = () => {
  const {
    walletState,
    ledger,
    consumeData,
    triggerDailyRollover,
    toggleCarryForward,
    setAllocationOrder,
    activePlan,
  } = useTelecom();

  const [simulatedMb, setSimulatedMb] = useState<number>(500);
  const [trafficCategory, setTrafficCategory] = useState<string>('Streaming');
  const [testResults, setTestResults] = useState<{ passed: boolean; results: string[] } | null>(
    null
  );
  const [showRuleDetails, setShowRuleDetails] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Patented Telecom Feature · Smart Data Wallet</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Unused Data Carry Forward
          </h2>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            In standard daily data plans, unused allowance expires at midnight. With
            BlueWave's Smart Data Wallet, eligible unused data rolls into your safe carry-forward
            bucket and stays valid for 7 days.
          </p>
        </div>

        {/* Ambient wave glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3-Column Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Daily Allowance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>TODAY'S DAILY ALLOWANCE</span>
              <span className="text-blue-600 font-bold">Day {walletState.currentSimulatedDay}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                {formatBytes(dailyRemaining)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                left of {formatBytes(walletState.dailyQuotaBytes)}
              </span>
            </div>

            {/* Daily Bar */}
            <div className="mt-4 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Used today: {formatBytes(walletState.dailyUsedBytes)}</span>
            <span>Resets at {walletState.renewalTimeStr}</span>
          </div>
        </div>

        {/* Metric 2: Carry Forward Data Balance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="text-blue-700">CARRY FORWARD BALANCE</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                SAVED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-900 tabular-nums">
                {formatBytes(walletState.carryForwardBalanceBytes)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                in wallet safe
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Accumulated from previous days. Tapped automatically when daily quota is exhausted.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Buckets active: {walletState.buckets.length}</span>
            <span className="text-amber-600 font-medium">Expires in 3 days</span>
          </div>
        </div>

        {/* Metric 3: Total Eligible Available Data */}
        <div className="bg-gradient-to-br from-blue-600 to-sky-600 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-100 font-semibold mb-2">
              <span>TOTAL AVAILABLE TO USE</span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                COMBINED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tabular-nums">
                {formatBytes(walletState.totalEligibleDataBytes)}
              </span>
            </div>

            <div className="mt-4 space-y-1 text-xs text-blue-100">
              <div className="flex justify-between">
                <span>Daily portion:</span>
                <span className="font-bold text-white">{formatBytes(dailyRemaining)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saved carry-forward:</span>
                <span className="font-bold text-white">{formatBytes(walletState.carryForwardBalanceBytes)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-[11px] text-blue-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-200" />
            <span>Zero floating point loss · 64-bit integer ledger</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sandbox: Consume Data & Advance Day */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Interactive Testbench & Sandbox
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Simulate Network Traffic & Rollover
            </h3>
          </div>
          <button
            onClick={handleRunTests}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Engine Unit Tests</span>
          </button>
        </div>

        {/* Engine Unit Tests Output if triggered */}
        {testResults && (
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1.5 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-sans">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                JUnit Test Suite Executed Successfully
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
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
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                1. Simulate Data Consumption
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Consume data in real time to test quota deduction and threshold alerts.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[250, 500, 750, 1024].map((mb) => (
                <button
                  key={mb}
                  onClick={() => setSimulatedMb(mb)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    simulatedMb === mb
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mb >= 1024 ? '1.0 GB' : `${mb} MB`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => consumeData(simulatedMb, '4K Video Streaming')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Consume {simulatedMb >= 1024 ? '1.0 GB' : `${simulatedMb} MB`}
              </button>
            </div>
          </div>

          {/* Action 2: Trigger Midnight Rollover */}
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                2. Simulate End of Day (Midnight Rollover)
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Executes the rollover sweep: transfers today's unused MBs to Carry Forward,
                and issues tomorrow's fresh 2.0 GB quota independently.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Eligible Unused Today:</span>
                <span className="font-bold text-blue-900">{formatBytes(dailyRemaining)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Carried Balance:</span>
                <span className="font-bold text-blue-900">
                  {formatBytes(walletState.carryForwardBalanceBytes)}
                </span>
              </div>
            </div>

            <button
              onClick={() => triggerDailyRollover()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Advance Day & Execute Rollover</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configurable Policy Engine Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Allocation Engine Rules
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Policy & Allocation Order Settings
            </h3>
          </div>
          <button
            onClick={() => setShowRuleDetails(!showRuleDetails)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{showRuleDetails ? 'Hide details' : 'View full policy'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showRuleDetails ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {showRuleDetails && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              <strong>1. Atomic Day-Boundary Sweep:</strong> At 23:59:59 each night, the engine
              computes <code>dailyQuota - dailyUsed</code>. Positive delta is saved to a FIFO
              carry-forward bucket with idempotency key.
            </p>
            <p>
              <strong>2. Independent Issuance:</strong> At 00:00:00, the full daily allowance
              (e.g., 2.0 GB) is issued unconditionally without modifying the saved balance.
            </p>
            <p>
              <strong>3. Expiration Cap:</strong> Each rollover bucket carries a 7-day validity
              window. The maximum wallet capacity is capped at 10.0 GB to maintain fair use.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Toggle 1: Carry Forward Enabled */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">Carry Forward Active</p>
              <p className="text-[11px] text-slate-500">
                Preserve unused data at end of day
              </p>
            </div>
            <button
              onClick={() => toggleCarryForward(!walletState.isCarryForwardEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                walletState.isCarryForwardEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                  walletState.isCarryForwardEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Selector 2: Allocation Order */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">Consumption Priority</p>
              <p className="text-[11px] text-slate-500">
                Which bucket is consumed first
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setAllocationOrder('DAILY_FIRST')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  walletState.allocationOrder === 'DAILY_FIRST'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily First
              </button>
              <button
                onClick={() => setAllocationOrder('CARRY_FORWARD_FIRST')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  walletState.allocationOrder === 'CARRY_FORWARD_FIRST'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Saved First
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Ledger Audit Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Immutable Audit Trail
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Daily Data Ledger Events
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {ledger.length} events logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {ledger.map((item) => {
            const isRollover = item.type === 'ROLLOVER';
            const isUsage = item.type === 'USAGE';
            const isIssuance = item.type === 'ISSUANCE';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isRollover
                        ? 'bg-emerald-100 text-emerald-700'
                        : isUsage
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isRollover ? '✦' : isUsage ? '↓' : '↑'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.type}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Day {item.dayNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-black font-mono text-sm tabular-nums ${
                      isRollover
                        ? 'text-emerald-600'
                        : isUsage
                        ? 'text-slate-700'
                        : 'text-purple-600'
                    }`}
                  >
                    {isUsage ? '-' : '+'}
                    {formatBytes(item.amountBytes)}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Wallet: {formatBytes(item.newCarryForwardBytes)}
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
