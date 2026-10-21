/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTelecom } from '../../context/TelecomContext';
import { formatBytes, ONE_GB, ONE_MB } from '../../engine/CarryForwardEngine';
import { GlobalCountryMarket, P2PListing } from '../../types/telecom';
import confetti from 'canvas-confetti';
import {
  Globe2,
  TrendingUp,
  Wallet,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Radio,
  Zap,
  Download,
  AlertCircle,
  Clock,
  ChevronRight,
  Send,
  Coins,
} from 'lucide-react';

export const DataMarketScreen: React.FC = () => {
  const {
    walletState,
    globalMarkets,
    p2pListings,
    earningsWallet,
    sellDataToGlobalMarket,
    createP2PListing,
    buyPeerListing,
    withdrawEarningsToUPI,
  } = useTelecom();

  const [activeMarketTab, setActiveMarketTab] = useState<'global' | 'p2p_buy' | 'p2p_sell' | 'history'>('global');
  
  // Global Export Modal state
  const [selectedCountryForExport, setSelectedCountryForExport] = useState<GlobalCountryMarket | null>(null);
  const [exportGigabytes, setExportGigabytes] = useState<number>(1);
  const [exportProcessing, setExportProcessing] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // New P2P Listing state
  const [sellAmountMb, setSellAmountMb] = useState<number>(1024);
  const [sellPriceInr, setSellPriceInr] = useState<number>(15);
  const [p2pProcessing, setP2pProcessing] = useState(false);

  // UPI Withdrawal Modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(earningsWallet.cashBalanceInr);
  const [upiVpa, setUpiVpa] = useState<string>(earningsWallet.payoutUpiId || 'aaditya@okhdfcbank');
  const [withdrawProcessing, setWithdrawProcessing] = useState(false);
  const [withdrawSuccessTx, setWithdrawSuccessTx] = useState<string | null>(null);

  const availableSellableBytes = walletState.carryForwardBalanceBytes + walletState.dailyRemainingBytes;
  const availableSellableGb = (availableSellableBytes / ONE_GB).toFixed(1);

  // Handler for Global Export
  const handleExecuteGlobalExport = async () => {
    if (!selectedCountryForExport) return;
    setExportProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = sellDataToGlobalMarket(selectedCountryForExport.id, exportGigabytes);
    setExportProcessing(false);

    if (result.success) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0056B3', '#10B981', '#F59E0B'],
      });
      setExportSuccessMessage(
        `Successfully exported ${exportGigabytes} GB to ${selectedCountryForExport.countryName} ${selectedCountryForExport.flag}! ₹${result.earnedInr} has been credited to your Earnings Wallet.`
      );
    }
  };

  // Handler for Creating Domestic P2P Listing
  const handlePublishP2PListing = (e: React.FormEvent) => {
    e.preventDefault();
    setP2pProcessing(true);
    setTimeout(() => {
      const bytes = Math.round(sellAmountMb * ONE_MB);
      createP2PListing(bytes, sellPriceInr);
      setP2pProcessing(false);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
      setActiveMarketTab('p2p_buy');
    }, 600);
  };

  // Handler for Buying Peer Listing
  const handleBuyListing = (listingId: string) => {
    const res = buyPeerListing(listingId);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0066FF', '#38BDF8'],
      });
    }
  };

  // Handler for UPI Withdrawal
  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const res = withdrawEarningsToUPI(withdrawAmount, upiVpa);
    setWithdrawProcessing(false);
    if (res.success) {
      setWithdrawSuccessTx(res.txId);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399'],
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-7 animate-fade-in">
      {/* 1. Header Hero Card with Cash Earnings Balance */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/60 border border-cyan-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-400/30 px-3 py-1 rounded-full text-xs font-bold text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>BlueWave P2P Exchange & Global RoamBridge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sell Unused Data & Earn Money
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Connect with subscribers who need data to buy or sell peer-to-peer, or export your excess
              Carry Forward data to <strong>expensive telecom countries</strong> (like Switzerland, UAE, USA & Germany)
              where tourist gigabytes cost up to $35/GB!
            </p>
          </div>

          {/* Earnings Cash Card in Frosted Glass */}
          <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl p-5 border border-white/15 min-w-[280px] shrink-0 shadow-2xl">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest block">
              Your Cash Earnings Wallet
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white font-mono tabular-nums">
                ₹{earningsWallet.cashBalanceInr}
              </span>
              <span className="text-xs text-slate-400 font-medium">withdrawable cash</span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">Total Earned</span>
                <span className="font-bold text-emerald-400 font-mono tabular-nums">₹{earningsWallet.totalEarnedInr}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">Data Sold</span>
                <span className="font-bold text-cyan-300 font-mono tabular-nums">{formatBytes(earningsWallet.totalDataSoldBytes)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setWithdrawAmount(earningsWallet.cashBalanceInr);
                setWithdrawSuccessTx(null);
                setShowWithdrawModal(true);
              }}
              disabled={earningsWallet.cashBalanceInr <= 0}
              className="w-full mt-4 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <ArrowDownLeft className="w-4 h-4 text-slate-950" />
              <span>Withdraw to UPI (Instant)</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        <button
          onClick={() => setActiveMarketTab('global')}
          className={`pb-3 px-3 text-xs font-black transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeMarketTab === 'global' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>High-Cost Country Arbitrage ({globalMarkets.length} Countries)</span>
          {activeMarketTab === 'global' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveMarketTab('p2p_buy')}
          className={`pb-3 px-3 text-xs font-black transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeMarketTab === 'p2p_buy' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Buy Peer Data ({p2pListings.filter((l) => l.status === 'ACTIVE').length} Live Offers)</span>
          {activeMarketTab === 'p2p_buy' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveMarketTab('p2p_sell')}
          className={`pb-3 px-3 text-xs font-black transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeMarketTab === 'p2p_sell' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Peer Listing (Sell Local)</span>
          {activeMarketTab === 'p2p_sell' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveMarketTab('history')}
          className={`pb-3 px-3 text-xs font-black transition-all relative flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeMarketTab === 'history' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Trades & Payout History ({earningsWallet.recentTrades.length})</span>
          {activeMarketTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
          )}
        </button>
      </div>

      {/* 3. TAB 1: Global High-Cost Country Arbitrage */}
      {activeMarketTab === 'global' && (
        <div className="space-y-6">
          {/* Informational Arbitrage Explainer Card */}
          <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                How Global Arbitrage Works
              </span>
              <h3 className="text-base font-black text-white">
                Earn ₹220 – ₹520 per GB by supplying expensive international roaming pools
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Mobile data in India is among the world's most affordable (~₹12/GB). But in Switzerland, Bermuda,
                and UAE, international tourists pay up to $35 (~₹2,900) per GB. BlueWave RoamBridge aggregates
                verified unused Carry Forward data into international roaming eSIM packages, passing the premium
                margin directly to your bank account!
              </p>
            </div>
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/10 text-center shrink-0">
              <span className="text-[10px] text-slate-400 block font-semibold">Your Available Data</span>
              <span className="text-xl font-black text-cyan-300 font-mono tabular-nums">
                {formatBytes(availableSellableBytes)}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Eligible to Export</span>
            </div>
          </div>

          {/* Grid of Global High Cost Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {globalMarkets.map((country) => (
              <div
                key={country.id}
                className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">
                          {country.countryName}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {country.countryCode} Market
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      {country.demandStatus}
                    </span>
                  </div>

                  {/* Pricing Comparison */}
                  <div className="py-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Tourist Retail Cost:</span>
                      <span className="font-semibold text-rose-400 line-through tabular-nums">
                        ${country.typicalRetailCostUsdPerGb.toFixed(2)}/GB
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="font-bold text-white">Your Cash Payout:</span>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                          ₹{country.payoutInrPerGb}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          ≈ ${country.payoutUsdEquivalent.toFixed(2)} / GB
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-2 border-t border-white/10 line-clamp-2 leading-relaxed">
                      {country.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCountryForExport(country);
                    setExportGigabytes(1);
                    setExportSuccessMessage(null);
                  }}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.02]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Export to {country.countryCode} Pool</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB 2: Buy Peer Data (Local Domestic Marketplace) */}
      {activeMarketTab === 'p2p_buy' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">
                Peer-to-Peer Data Board
              </h3>
              <p className="text-xs text-slate-400">
                Low on daily quota? Buy verified data directly from fellow BlueWave subscribers at friendly rates.
              </p>
            </div>
            <button
              onClick={() => setActiveMarketTab('p2p_sell')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black shadow-lg hover:from-blue-500 hover:to-cyan-400 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Your Data for Sale</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {p2pListings.map((listing) => {
              const isAvailable = listing.status === 'ACTIVE';
              return (
                <div
                  key={listing.id}
                  className={`bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border transition-all ${
                    isAvailable
                      ? 'border-white/10 hover:border-cyan-500/40 shadow-2xl'
                      : 'border-white/5 opacity-50 bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-start justify-between pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {listing.sellerName}
                        </span>
                        {listing.isOwnListing && (
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {listing.sellerMaskedMobile}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <div className="py-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-medium">Offered Data:</span>
                      <span className="text-2xl font-black text-white font-mono tabular-nums">
                        {formatBytes(listing.amountBytes)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-medium">Price:</span>
                      <span className="text-lg font-black text-cyan-300 font-mono tabular-nums">
                        ₹{listing.priceInr}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-white/10 flex items-center justify-between font-medium">
                      <span>Network: {listing.verifiedNetwork}</span>
                      <span className="text-emerald-400">Instant Transfer</span>
                    </div>
                  </div>

                  {isAvailable && !listing.isOwnListing && (
                    <button
                      onClick={() => handleBuyListing(listing.id)}
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Buy for ₹{listing.priceInr}</span>
                    </button>
                  )}

                  {listing.isOwnListing && isAvailable && (
                    <div className="w-full mt-2 py-2 text-center text-xs text-slate-400 font-medium bg-white/5 rounded-xl border border-white/10">
                      Your Active Listing (In Escrow)
                    </div>
                  )}

                  {!isAvailable && (
                    <div className="w-full mt-2 py-2 text-center text-xs text-slate-500 font-medium">
                      Sold out to peer
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: Create Peer Listing (Sell Local) */}
      {activeMarketTab === 'p2p_sell' && (
        <div className="max-w-xl mx-auto bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="pb-4 border-b border-white/10">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              P2P Domestic Listing
            </span>
            <h3 className="text-xl font-black text-white">
              Sell Unused Carry Forward Data to Peers
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your data will be held in safe telecom escrow and transferred to buyer upon purchase. You receive instant cash credit in your wallet!
            </p>
          </div>

          <form onSubmit={handlePublishP2PListing} className="space-y-5 text-xs">
            {/* Amount to Sell */}
            <div>
              <label className="font-bold text-slate-300 block mb-2">
                Select Amount of Data to Sell
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1024, 2048, 3072].map((mb) => (
                  <button
                    key={mb}
                    type="button"
                    onClick={() => {
                      setSellAmountMb(mb);
                      setSellPriceInr(Math.round((mb / 1024) * 15));
                    }}
                    className={`py-2 px-3 rounded-xl font-mono font-bold border transition-all cursor-pointer ${
                      sellAmountMb === mb
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`}
                  </button>
                ))}
              </div>
            </div>

            {/* Price in INR */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-300">Listing Price (₹ INR)</label>
                <span className="text-[11px] text-slate-400">Market Avg: ₹14–₹18 / GB</span>
              </div>
              <input
                type="number"
                min={5}
                max={150}
                value={sellPriceInr}
                onChange={(e) => setSellPriceInr(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-sm font-bold text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Wallet Balance Check */}
            <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Available in Wallet:</span>
                <span className="font-black text-cyan-300 font-mono text-sm">{formatBytes(availableSellableBytes)}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">You will earn:</span>
                <span className="font-black text-emerald-400 font-mono text-base">₹{sellPriceInr}.00</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={p2pProcessing || availableSellableBytes < sellAmountMb * ONE_MB}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {p2pProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Listing to Peer Board...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Listing for ₹{sellPriceInr}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 6. TAB 4: Trades & Payout History */}
      {activeMarketTab === 'history' && (
        <div className="bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-black text-white text-sm">Marketplace Settlement Records</h3>
              <p className="text-xs text-slate-400">All domestic trades, global exports, and UPI settlements</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Real-time Accounting</span>
          </div>

          <div className="space-y-3">
            {earningsWallet.recentTrades.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No trade records yet.</p>
            ) : (
              earningsWallet.recentTrades.map((trade) => {
                const isSell = trade.type.startsWith('SELL');
                return (
                  <div
                    key={trade.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isSell
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                        }`}
                      >
                        {isSell ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {trade.type === 'SELL_GLOBAL'
                              ? 'Global RoamPool Export'
                              : trade.type === 'SELL_DOMESTIC'
                              ? 'Domestic P2P Sale'
                              : 'Peer Data Purchase'}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">{trade.countryOrPeer}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {trade.payoutMethod} · {new Date(trade.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black font-mono text-sm tabular-nums ${
                          isSell ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {isSell ? `+₹${trade.amountInr}` : `-₹${trade.amountInr}`}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {formatBytes(trade.amountBytes)} transferred
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: Global Export Sheet */}
      {selectedCountryForExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{selectedCountryForExport.flag}</span>
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    Cross-Border Roaming Arbitrage
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Export Data to {selectedCountryForExport.countryName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCountryForExport(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {exportSuccessMessage ? (
              <div className="text-center py-5 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-white text-base">Export Executed!</h4>
                <p className="text-xs text-slate-300 leading-relaxed px-4">
                  {exportSuccessMessage}
                </p>
                <button
                  onClick={() => setSelectedCountryForExport(null)}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  Close & View Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Rate Card */}
                <div className="bg-slate-950/70 rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Retail Price in {selectedCountryForExport.countryName}:</span>
                    <span className="font-semibold text-rose-400 line-through">
                      ${selectedCountryForExport.typicalRetailCostUsdPerGb.toFixed(2)}/GB
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-bold text-white">Your Arbitrage Payout:</span>
                    <span className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                      ₹{selectedCountryForExport.payoutInrPerGb} / GB
                    </span>
                  </div>
                </div>

                {/* Amount to Export */}
                <div>
                  <label className="font-bold text-slate-300 block mb-2">
                    Select Data Amount to Export (GB)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((gb) => (
                      <button
                        key={gb}
                        type="button"
                        onClick={() => setExportGigabytes(gb)}
                        className={`py-2 px-3 rounded-xl font-mono font-bold border transition-all cursor-pointer ${
                          exportGigabytes === gb
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {gb} GB
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary calculation */}
                <div className="p-3.5 bg-slate-950/70 rounded-xl space-y-1.5 text-slate-300 border border-white/10">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available in your wallet:</span>
                    <span className="font-bold text-cyan-300 font-mono">{formatBytes(availableSellableBytes)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-white/10">
                    <span>Total Cash to Receive:</span>
                    <span className="text-emerald-400 font-mono text-base font-black">
                      ₹{exportGigabytes * selectedCountryForExport.payoutInrPerGb}.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-200 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant credit to BlueWave Wallet · 100% Guaranteed Payout</span>
                </div>

                <button
                  onClick={handleExecuteGlobalExport}
                  disabled={exportProcessing || availableSellableBytes < exportGigabytes * ONE_GB}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {exportProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validating Global Roaming Partner & Depositing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        Sell {exportGigabytes} GB for ₹{exportGigabytes * selectedCountryForExport.payoutInrPerGb}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Instant UPI Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Direct Bank Settlement
                </span>
                <h3 className="text-lg font-black text-white">Withdraw to UPI (0% Fee)</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccessTx ? (
              <div className="text-center py-4 space-y-3 text-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-white text-base">Transferred to Bank!</h4>
                <p className="text-slate-300">
                  ₹{withdrawAmount} has been disbursed to <strong className="text-white font-mono">{upiVpa}</strong> via NPCI Instant UPI.
                </p>
                <p className="font-mono text-cyan-300 text-[11px]">UTR Ref: {withdrawSuccessTx}</p>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">UPI VPA Address</label>
                  <input
                    type="text"
                    required
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-300">Withdrawal Amount (₹)</label>
                    <span className="text-slate-400 font-mono">
                      Max: ₹{earningsWallet.cashBalanceInr}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={earningsWallet.cashBalanceInr}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-white/10 bg-slate-950 text-sm font-bold text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 bg-slate-950/70 rounded-xl text-[11px] text-slate-400 border border-white/10">
                  Disbursed instantly via 24x7 IMPS / UPI rails. Zero commission or payout fees.
                </div>

                <button
                  type="submit"
                  disabled={withdrawProcessing || withdrawAmount <= 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {withdrawProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Sending UPI Request...</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownLeft className="w-4 h-4 text-slate-950" />
                      <span>Withdraw ₹{withdrawAmount} Instantly</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
