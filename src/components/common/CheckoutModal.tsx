/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RechargePlan, PaymentMethod, PaymentTransaction } from '../../types/telecom';
import { useTelecom } from '../../context/TelecomContext';
import { formatBytes } from '../../engine/CarryForwardEngine';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  QrCode,
  Building,
  Sparkles,
  Zap,
} from 'lucide-react';

interface CheckoutModalProps {
  plan: RechargePlan | null;
  onClose: () => void;
  onRechargeComplete?: (tx: PaymentTransaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  onClose,
  onRechargeComplete,
}) => {
  const { userProfile, executeRecharge } = useTelecom();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');
  const [customUpiId, setCustomUpiId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);

  if (!plan) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const result = await executeRecharge(
        plan,
        paymentMethod,
        selectedUpiApp === 'Other UPI ID' ? customUpiId || 'UPI App' : selectedUpiApp
      );
      if (result.success) {
        setCompletedTx(result.transaction);
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0056B3', '#0066FF', '#38BDF8', '#10B981'],
        });
        if (onRechargeComplete) {
          onRechargeComplete(result.transaction);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!completedTx) return;
    const content = `
==============================================================
             BLUEWAVE SIGNATURE TELECOM SERVICES
        GST Tax Invoice & Electronic Recharge Receipt
==============================================================
Invoice Number:    ${completedTx.invoiceNumber}
Date & Time:       ${new Date(completedTx.timestamp).toLocaleString('en-IN')}
Transaction Ref:   ${completedTx.referenceNumber}
Subscriber MSISDN: ${userProfile.mobileNumber}
Circle / State:    ${userProfile.circle}
GSTIN:             ${completedTx.gstNumber}

--------------------------------------------------------------
PLAN DETAILS:
Plan Name:         ${plan.name}
Validity:          ${plan.validityDays} Days
Data Allowance:    ${plan.dailyDataBytes ? `${formatBytes(plan.dailyDataBytes)} / Day` : formatBytes(plan.totalDataBytes || 0)}
Voice Benefits:    ${plan.voice}
SMS Allowance:     ${plan.sms}
5G Status:         ${plan.is5GEligible ? 'True 5G Unlimited Included' : 'Standard 4G/5G'}
Carry Forward:     ${plan.carryForwardEligible ? 'Smart Data Wallet Enabled' : 'Not Eligible'}

--------------------------------------------------------------
TAX COMPUTATION (INR):
Taxable Value:     ₹${(plan.price / 1.18).toFixed(2)}
CGST (9%):         ₹${((plan.price / 1.18) * 0.09).toFixed(2)}
SGST (9%):         ₹${((plan.price / 1.18) * 0.09).toFixed(2)}
Total Amount Paid: ₹${plan.price}.00

Payment Mode:      ${completedTx.paymentDetails}
Status:            PAID & CONFIRMED (DEMO TELECOM SANDBOX)
==============================================================
Thank you for choosing BlueWave Recharge!
Support: 1800-889-9999 | support@bluewave.in
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BlueWave_Receipt_${completedTx.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {completedTx ? (
          /* Success Screen in Obsidian Glass */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                Recharge Successful
              </span>
              <h2 className="text-3xl font-black text-white font-mono mt-2 tracking-tight">
                ₹{plan.price} Activated
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {plan.name} is now active on <span className="font-mono text-cyan-300 font-bold">{userProfile.mobileNumber}</span>
              </p>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-950/70 rounded-2xl p-4 text-left space-y-2 border border-white/10 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref</span>
                <span className="font-mono font-bold text-cyan-300">
                  {completedTx.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Validity</span>
                <span className="font-bold text-white">
                  {plan.validityDays} Days
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Data Allowance</span>
                <span className="font-bold text-white font-mono">
                  {plan.dailyDataBytes ? `${formatBytes(plan.dailyDataBytes)} / Day` : formatBytes(plan.totalDataBytes || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode</span>
                <span className="font-medium text-white">
                  {completedTx.paymentDetails}
                </span>
              </div>
              {plan.carryForwardEligible && (
                <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Smart Carry Forward Data Wallet is active</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleDownloadInvoice}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download GST Tax Receipt
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Selection Screen in Obsidian Glass */
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Order Confirmation
                </span>
                <h3 className="text-xl font-black text-white">
                  ₹{plan.price} Recharge
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Snapshot Card */}
            <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For <span className="font-mono text-cyan-300 font-semibold">{userProfile.maskedMobile}</span> ({userProfile.circle})
                  </p>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  ₹{plan.price}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                <div className="bg-white/5 rounded-xl py-2 px-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Validity</span>
                  <span className="text-xs font-bold text-white font-mono">
                    {plan.validityDays} Days
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl py-2 px-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Data</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {plan.dailyDataBytes ? `${formatBytes(plan.dailyDataBytes)}/day` : formatBytes(plan.totalDataBytes || 0)}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl py-2 px-2 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Voice</span>
                  <span className="text-xs font-bold text-emerald-400">Unlimited</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Select Payment Mode (Sandbox Demo)
              </label>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-cyan-400 bg-cyan-950/50 text-white ring-1 ring-cyan-400 shadow-sm'
                      : 'border-white/10 hover:border-white/20 text-slate-400 bg-slate-950/50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    paymentMethod === 'CARD'
                      ? 'border-cyan-400 bg-cyan-950/50 text-white ring-1 ring-cyan-400 shadow-sm'
                      : 'border-white/10 hover:border-white/20 text-slate-400 bg-slate-950/50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">Card Payment</span>
                </button>
              </div>

              {/* UPI Options */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Choose UPI App
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between cursor-pointer transition-all ${
                          selectedUpiApp === app
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{app}</span>
                        {selectedUpiApp === app && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Options */}
              {paymentMethod === 'CARD' && (
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">HDFC Bank Debit Card</p>
                      <p className="text-[11px] text-slate-400 font-mono">•••• •••• •••• 4419 (Demo Card)</p>
                    </div>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    No real CVV or PIN is ever requested or stored in this demo sandbox.
                  </p>
                </div>
              )}
            </div>

            {/* Sandbox Notice & Security */}
            <div className="flex items-center gap-2 p-3 bg-slate-950/70 rounded-xl text-slate-400 text-[11px] border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                256-bit Simulated Secure Checkout · Idempotent Transaction Processing
              </span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Telecom Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Pay ₹{plan.price} & Activate Plan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
