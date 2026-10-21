/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { PaymentTransaction } from '../../types/telecom';
import { formatBytes } from '../../engine/CarryForwardEngine';
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  FileText,
  Filter,
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { transactions, ledger, userProfile } = useTelecom();
  const [activeTab, setActiveTab] = useState<'recharges' | 'data_ledger'>('recharges');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.referenceNumber.toLowerCase().includes(q) ||
      tx.planName.toLowerCase().includes(q) ||
      tx.invoiceNumber.toLowerCase().includes(q) ||
      tx.paymentDetails.toLowerCase().includes(q)
    );
  });

  const downloadReceipt = (tx: PaymentTransaction) => {
    const text = `
==============================================================
             BLUEWAVE SIGNATURE TELECOM SERVICES
                 GST TAX INVOICE & CASH RECEIPT
==============================================================
Invoice Number:    ${tx.invoiceNumber}
Date of Recharge:  ${new Date(tx.timestamp).toLocaleString('en-IN')}
Transaction ID:    ${tx.referenceNumber}
Subscriber Mobile: ${userProfile.mobileNumber}
Telecom Circle:    ${userProfile.circle}
GST Identification: ${tx.gstNumber}
--------------------------------------------------------------
Plan Description:  ${tx.planName}
Pack Validity:     ${tx.validityDays} Days
Payment Channel:   ${tx.paymentDetails}
Carry Forward:     ${tx.carryForwardEligible ? 'Eligible for Smart Data Wallet' : 'Standard'}
--------------------------------------------------------------
Base Amount:       ₹${(tx.amount / 1.18).toFixed(2)}
GST (18% Total):   ₹${(tx.amount - tx.amount / 1.18).toFixed(2)}
TOTAL PAID:        ₹${tx.amount}.00
STATUS:            ${tx.status} (Verified By Operator Sandbox)
==============================================================
Customer Care: 1800-889-9999 | care@bluewave.in
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${tx.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
            Statements & Activity
          </span>
          <h2 className="text-2xl font-black text-white">
            Recharge & Data Ledger History
          </h2>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-white/10 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('recharges')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'recharges'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recharge Invoices ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('data_ledger')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'data_ledger'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Data Wallet Ledger ({ledger.length})
          </button>
        </div>
      </div>

      {activeTab === 'recharges' ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number, transaction reference, or plan..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/80 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-xs text-white placeholder-slate-400 shadow-xl transition-all"
            />
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-white/10 hover:border-cyan-500/30 shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-sm">{tx.planName}</h4>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {tx.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(tx.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · Ref: <span className="font-mono text-cyan-300">{tx.referenceNumber}</span>
                    </p>

                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      {tx.paymentDetails}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-white/10">
                  <span className="text-2xl font-black text-white font-mono tabular-nums">
                    ₹{tx.amount}
                  </span>
                  <button
                    onClick={() => downloadReceipt(tx)}
                    className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tax Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Data Wallet Activity Ledger */
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-black text-white text-sm">Chronological Data Ledger</h3>
              <p className="text-xs text-slate-400">Every byte issuance, usage, and rollover event</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">ISO-8601 Timestamps</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {ledger.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.type}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{item.description}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-sm tabular-nums ${
                      item.type === 'ROLLOVER'
                        ? 'text-emerald-400'
                        : item.type === 'USAGE'
                        ? 'text-slate-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {item.type === 'USAGE' ? '-' : '+'}
                    {formatBytes(item.amountBytes)}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Saved Balance: {formatBytes(item.newCarryForwardBytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
