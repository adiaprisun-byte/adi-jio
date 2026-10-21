/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BlueWave Telecom Context & Authoritative State
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  RechargePlan,
  SmartDataWalletState,
  LedgerEntry,
  PaymentTransaction,
  TelecomNotification,
  PaymentMethod,
  P2PListing,
  GlobalCountryMarket,
  UserEarningsWallet,
  P2PTradeRecord,
  TelecomProfileWallet,
  WalletTransactionRecord,
} from '../types/telecom';
import {
  createInitialWalletState,
  CarryForwardEngine,
  ONE_MB,
  ONE_GB,
  formatBytes,
} from '../engine/CarryForwardEngine';
import { INITIAL_PLANS } from '../data/plansCatalog';
import {
  GLOBAL_HIGH_COST_COUNTRIES,
  INITIAL_P2P_LISTINGS,
  INITIAL_TRADE_RECORDS,
} from '../data/marketplaceData';

export interface TelecomContextType {
  userProfile: UserProfile;
  activePlan: RechargePlan;
  walletState: SmartDataWalletState;
  plans: RechargePlan[];
  transactions: PaymentTransaction[];
  ledger: LedgerEntry[];
  notifications: TelecomNotification[];
  unreadCount: number;
  isDemoMode: boolean;
  language: 'en' | 'hi';
  viewMode: 'web' | 'mobile_simulator';
  isMaskedMobile: boolean;
  
  // P2P Data Market & Global Roaming Arbitrage
  p2pListings: P2PListing[];
  globalMarkets: GlobalCountryMarket[];
  earningsWallet: UserEarningsWallet;
  profileWallet: TelecomProfileWallet;

  // Actions
  toggleMaskMobile: () => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  setViewMode: (mode: 'web' | 'mobile_simulator') => void;
  toggleDemoMode: (isDemo: boolean) => void;
  consumeData: (megabytes: number, reason?: string) => void;
  triggerDailyRollover: () => void;
  executeRecharge: (
    plan: RechargePlan,
    method: PaymentMethod,
    upiApp?: string
  ) => Promise<{ success: boolean; transaction: PaymentTransaction }>;
  toggleCarryForward: (enabled: boolean) => void;
  setAllocationOrder: (order: 'DAILY_FIRST' | 'CARRY_FORWARD_FIRST') => void;
  switchActiveNumber: (number: string) => void;
  updatePlanAdmin: (plan: RechargePlan) => void;
  addPlanAdmin: (plan: RechargePlan) => void;
  markNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  sellDataToGlobalMarket: (countryId: string, gigabytes: number) => { success: boolean; earnedInr: number };
  createP2PListing: (amountBytes: number, priceInr: number) => { success: boolean; listing: P2PListing };
  buyPeerListing: (listingId: string) => { success: boolean; message: string };
  withdrawEarningsToUPI: (amountInr: number, upiId: string) => { success: boolean; txId: string };
  topUpProfileWallet: (amountInr: number, method: string) => { success: boolean; txId: string };
  toggleAutoRecharge: (enabled: boolean) => void;
}

const TelecomContext = createContext<TelecomContextType | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  name: 'Aaditya Sharma',
  mobileNumber: '+91 98765 43210',
  maskedMobile: '+91 98••• ••210',
  circle: 'Mumbai & Maharashtra',
  simType: '5G eSIM',
  accountStatus: 'Active',
  is5GDeviceDetected: true,
  linkedNumbers: [
    {
      name: 'Primary Voice & Data',
      number: '+91 98765 43210',
      type: 'Prepaid Mobile',
      balance: '₹349 Plan Active (24d left)',
    },
    {
      name: 'BlueWave Home Fiber',
      number: '+91 22 2456 7890',
      type: 'Fiber Broadband',
      balance: '300 Mbps Unlimited (18d left)',
    },
    {
      name: 'Family Secondary SIM',
      number: '+91 98123 67890',
      type: 'Family Add-on',
      balance: '₹198 Plan Active (6d left)',
    },
  ],
};

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-bw-892104',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    planId: 'plan-349',
    planName: 'True 5G Unlimited Daily (₹349)',
    amount: 349,
    method: 'UPI',
    upiApp: 'Google Pay',
    status: 'SUCCESS',
    referenceNumber: 'BW-UPI-98217349182',
    gstNumber: '27AAACB2184Q1Z8',
    invoiceNumber: 'INV-2026-08192',
    paymentDetails: 'Paid via GPay UPI (aaditya@okhdfcbank)',
    validityDays: 28,
    carryForwardEligible: true,
  },
  {
    id: 'tx-bw-771239',
    timestamp: Date.now() - 32 * 24 * 60 * 60 * 1000,
    planId: 'plan-399',
    planName: 'Power Streamer 2.5 GB/day (₹399)',
    amount: 399,
    method: 'CARD',
    status: 'SUCCESS',
    referenceNumber: 'BW-CRD-1192847291',
    gstNumber: '27AAACB2184Q1Z8',
    invoiceNumber: 'INV-2026-04128',
    paymentDetails: 'HDFC Bank Credit Card ending 4419',
    validityDays: 28,
    carryForwardEligible: true,
  },
];

export const TelecomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [plans, setPlans] = useState<RechargePlan[]>(INITIAL_PLANS);
  const [activePlan, setActivePlan] = useState<RechargePlan>(INITIAL_PLANS[0]);
  const [walletState, setWalletState] = useState<SmartDataWalletState>(() =>
    createInitialWalletState(2.0)
  );
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [viewMode, setViewMode] = useState<'web' | 'mobile_simulator'>('web');
  const [isMaskedMobile, setIsMaskedMobile] = useState<boolean>(true);

  // Initial Seed Ledger entries
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    {
      id: 'ledg-init-1',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      type: 'ROLLOVER',
      amountBytes: Math.round(1.25 * ONE_GB),
      previousDailyBytes: Math.round(1.25 * ONE_GB),
      newDailyBytes: 0,
      previousCarryForwardBytes: 0,
      newCarryForwardBytes: Math.round(1.25 * ONE_GB),
      description: 'Preserved 1.25 GB unused daily quota into Carry Forward balance',
      dayNumber: 1,
    },
    {
      id: 'ledg-init-2',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      type: 'ROLLOVER',
      amountBytes: Math.round(1.0 * ONE_GB),
      previousDailyBytes: Math.round(1.0 * ONE_GB),
      newDailyBytes: 0,
      previousCarryForwardBytes: Math.round(1.25 * ONE_GB),
      newCarryForwardBytes: Math.round(2.25 * ONE_GB),
      description: 'Preserved 1.0 GB unused daily quota into Carry Forward balance',
      dayNumber: 2,
    },
    {
      id: 'ledg-init-3',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 + 100,
      type: 'ISSUANCE',
      amountBytes: Math.round(2.0 * ONE_GB),
      previousDailyBytes: 0,
      newDailyBytes: Math.round(2.0 * ONE_GB),
      previousCarryForwardBytes: Math.round(2.25 * ONE_GB),
      newCarryForwardBytes: Math.round(2.25 * ONE_GB),
      description: 'Issued fresh daily allowance of 2.0 GB for Day 3',
      dayNumber: 3,
    },
  ]);

  const [notifications, setNotifications] = useState<TelecomNotification[]>([
    {
      id: 'notif-1',
      title: 'Carry Forward Active',
      message: 'You saved 1.0 GB yesterday. Your Carry Forward Data balance is 2.25 GB.',
      timestamp: Date.now() - 3600000 * 4,
      type: 'DATA_SAVED',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'True 5G Unlimited Ready',
      message: 'Your area has full 5G coverage. Enjoy unlimited 5G data at zero extra cost.',
      timestamp: Date.now() - 3600000 * 24,
      type: '5G_PROMO',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleMaskMobile = () => setIsMaskedMobile((prev) => !prev);

  const toggleDemoMode = (demo: boolean) => setIsDemoMode(demo);

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const consumeData = (megabytes: number, reason: string = 'Video Streaming & Browsing') => {
    const bytesToConsume = Math.round(megabytes * ONE_MB);
    const { nextState, ledgerEntries } = CarryForwardEngine.consumeData(
      walletState,
      bytesToConsume,
      reason
    );
    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }
  };

  const triggerDailyRollover = () => {
    const idempotencyKey = `rollover-day-${walletState.currentSimulatedDay}-${Date.now()}`;
    const { nextState, ledgerEntries, notification } = CarryForwardEngine.executeDailyRollover(
      walletState,
      idempotencyKey
    );

    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }

    if (notification) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: notification.title,
          message: notification.message,
          timestamp: Date.now(),
          type: notification.type,
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const executeRecharge = async (
    plan: RechargePlan,
    method: PaymentMethod,
    upiApp?: string
  ): Promise<{ success: boolean; transaction: PaymentTransaction }> => {
    // Simulate real gateway processing latency
    await new Promise((resolve) => setTimeout(resolve, 900));

    const now = Date.now();
    const refNum = `BW-${method.substring(0, 3)}-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const invNum = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTx: PaymentTransaction = {
      id: `tx-${now}`,
      timestamp: now,
      planId: plan.id,
      planName: `${plan.name} (₹${plan.price})`,
      amount: plan.price,
      method,
      upiApp: method === 'UPI' ? upiApp || 'BHIM UPI' : undefined,
      status: 'SUCCESS',
      referenceNumber: refNum,
      gstNumber: '27AAACB2184Q1Z8',
      invoiceNumber: invNum,
      paymentDetails:
        method === 'UPI'
          ? `Paid via ${upiApp || 'UPI'} (${userProfile.mobileNumber.replace(/\s+/g, '')}@upi)`
          : method === 'CARD'
          ? 'HDFC Bank Visa Card ending 4419'
          : method === 'NET_BANKING'
          ? 'State Bank of India NetBanking'
          : 'BlueWave PayLater (Pre-approved)',
      validityDays: plan.validityDays,
      carryForwardEligible: plan.carryForwardEligible,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setActivePlan(plan);

    // Apply plan allowance to Smart Data Wallet
    const dailyAllowanceGb = plan.dailyDataBytes ? plan.dailyDataBytes / ONE_GB : 2.0;
    const { nextState, ledgerEntries, notification } = CarryForwardEngine.applyRecharge(
      walletState,
      dailyAllowanceGb,
      plan.name
    );

    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }

    if (notification) {
      setNotifications((prev) => [
        {
          id: `notif-${now}`,
          title: notification.title,
          message: notification.message,
          timestamp: now,
          type: 'RECHARGE_SUCCESS',
          read: false,
        },
        ...prev,
      ]);
    }

    return { success: true, transaction: newTx };
  };

  const toggleCarryForward = (enabled: boolean) => {
    setWalletState((prev) => ({
      ...prev,
      isCarryForwardEnabled: enabled,
    }));
  };

  const setAllocationOrder = (order: 'DAILY_FIRST' | 'CARRY_FORWARD_FIRST') => {
    setWalletState((prev) => ({
      ...prev,
      allocationOrder: order,
    }));
  };

  const switchActiveNumber = (newNumber: string) => {
    setUserProfile((prev) => ({
      ...prev,
      mobileNumber: newNumber,
      maskedMobile: newNumber.replace(/(\+\d{2}\s\d{2})\d{3}\s\d{2}(\d{3})/, '$1••• ••$2'),
    }));
  };

  const updatePlanAdmin = (updated: RechargePlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activePlan.id === updated.id) {
      setActivePlan(updated);
    }
  };

  const addPlanAdmin = (newPlan: RechargePlan) => {
    setPlans((prev) => [newPlan, ...prev]);
  };

  const [p2pListings, setP2pListings] = useState<P2PListing[]>(INITIAL_P2P_LISTINGS);
  const [globalMarkets] = useState<GlobalCountryMarket[]>(GLOBAL_HIGH_COST_COUNTRIES);
  const [earningsWallet, setEarningsWallet] = useState<UserEarningsWallet>({
    cashBalanceInr: 355,
    totalEarnedInr: 1480,
    totalDataSoldBytes: 4.5 * ONE_GB,
    totalDataBoughtBytes: 1.0 * ONE_GB,
    payoutUpiId: 'aaditya@okhdfcbank',
    recentTrades: INITIAL_TRADE_RECORDS,
  });

  const sellDataToGlobalMarket = (countryId: string, gigabytes: number) => {
    const market = globalMarkets.find((m) => m.id === countryId);
    if (!market || gigabytes <= 0) return { success: false, earnedInr: 0 };
    const bytesToSell = Math.round(gigabytes * ONE_GB);
    const earnedInr = Math.round(gigabytes * market.payoutInrPerGb);

    const { nextState, ledgerEntries } = CarryForwardEngine.sellData(
      walletState,
      bytesToSell,
      `Global RoamPool (${market.countryName} ${market.flag})`,
      earnedInr
    );

    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }

    const tradeRecord: P2PTradeRecord = {
      id: `trd-${Date.now()}`,
      timestamp: Date.now(),
      type: 'SELL_GLOBAL',
      amountBytes: bytesToSell,
      amountInr: earnedInr,
      counterparty: `Global RoamBridge (${market.countryCode})`,
      countryOrPeer: `${market.countryName} ${market.flag}`,
      status: 'COMPLETED',
      payoutMethod: 'Direct Credit to BlueWave Cash Wallet (UPI ready)',
    };

    setEarningsWallet((prev) => ({
      ...prev,
      cashBalanceInr: prev.cashBalanceInr + earnedInr,
      totalEarnedInr: prev.totalEarnedInr + earnedInr,
      totalDataSoldBytes: prev.totalDataSoldBytes + bytesToSell,
      recentTrades: [tradeRecord, ...prev.recentTrades],
    }));

    setNotifications((prev) => [
      {
        id: `notif-sell-${Date.now()}`,
        title: `Data Export Completed! Earned ₹${earnedInr}`,
        message: `Successfully exported ${formatBytes(bytesToSell)} to ${market.countryName} ${market.flag}. ₹${earnedInr} has been credited to your cash balance!`,
        timestamp: Date.now(),
        type: 'DATA_SAVED',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, earnedInr };
  };

  const createP2PListing = (amountBytes: number, priceInr: number) => {
    const { nextState, ledgerEntries } = CarryForwardEngine.sellData(
      walletState,
      amountBytes,
      'P2P Marketplace Escrow',
      priceInr
    );
    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }

    const newListing: P2PListing = {
      id: `p2p-my-${Date.now()}`,
      sellerName: userProfile.name,
      sellerMaskedMobile: userProfile.maskedMobile,
      amountBytes,
      priceInr,
      status: 'ACTIVE',
      createdTimestamp: Date.now(),
      expiresTimestamp: Date.now() + 12 * 3600 * 1000,
      verifiedNetwork: 'BlueWave 5G',
      isOwnListing: true,
    };

    setP2pListings((prev) => [newListing, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-list-${Date.now()}`,
        title: 'P2P Listing Published',
        message: `Your listing for ${formatBytes(amountBytes)} at ₹${priceInr} is now live in the marketplace.`,
        timestamp: Date.now(),
        type: 'DATA_SAVED',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, listing: newListing };
  };

  const buyPeerListing = (listingId: string) => {
    const listing = p2pListings.find((l) => l.id === listingId);
    if (!listing || listing.status !== 'ACTIVE') {
      return { success: false, message: 'Listing is no longer available' };
    }

    // Add data to buyer's wallet
    const { nextState, ledgerEntries } = CarryForwardEngine.buyData(
      walletState,
      listing.amountBytes,
      listing.sellerName,
      listing.priceInr
    );
    setWalletState(nextState);
    if (ledgerEntries.length > 0) {
      setLedger((prev) => [...ledgerEntries, ...prev]);
    }

    // Mark listing as SOLD
    setP2pListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'SOLD' } : l))
    );

    const tradeRecord: P2PTradeRecord = {
      id: `trd-buy-${Date.now()}`,
      timestamp: Date.now(),
      type: 'BUY_PEER',
      amountBytes: listing.amountBytes,
      amountInr: listing.priceInr,
      counterparty: `${listing.sellerName} (${listing.sellerMaskedMobile})`,
      countryOrPeer: 'Peer Direct (Domestic)',
      status: 'COMPLETED',
      payoutMethod: 'Paid via BlueWave UPI',
    };

    setEarningsWallet((prev) => ({
      ...prev,
      totalDataBoughtBytes: prev.totalDataBoughtBytes + listing.amountBytes,
      recentTrades: [tradeRecord, ...prev.recentTrades],
    }));

    setNotifications((prev) => [
      {
        id: `notif-buy-${Date.now()}`,
        title: 'Peer Data Added to Wallet!',
        message: `Added ${formatBytes(listing.amountBytes)} from ${listing.sellerName} to your Carry Forward balance for ₹${listing.priceInr}.`,
        timestamp: Date.now(),
        type: 'RECHARGE_SUCCESS',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, message: `Successfully bought ${formatBytes(listing.amountBytes)}` };
  };

  const withdrawEarningsToUPI = (amountInr: number, upiId: string) => {
    if (amountInr <= 0 || amountInr > earningsWallet.cashBalanceInr) {
      return { success: false, txId: '' };
    }
    const txId = `WTH-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setEarningsWallet((prev) => ({
      ...prev,
      cashBalanceInr: prev.cashBalanceInr - amountInr,
      payoutUpiId: upiId || prev.payoutUpiId,
    }));

    setNotifications((prev) => [
      {
        id: `notif-wth-${Date.now()}`,
        title: `Withdrawal Successful: ₹${amountInr}`,
        message: `₹${amountInr} has been transferred directly to your UPI VPA (${upiId || earningsWallet.payoutUpiId}). Ref: ${txId}`,
        timestamp: Date.now(),
        type: 'DATA_SAVED',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, txId };
  };

  // Dedicated Profile Telecom & Cash Wallet State
  const [profileWallet, setProfileWallet] = useState<TelecomProfileWallet>({
    cashBalanceInr: 355,
    telecomCreditBalanceInr: 150,
    autoRechargeEnabled: true,
    linkedUpiVpa: 'aaditya@okhdfcbank',
    tierStatus: 'BlueWave Signature Diamond',
    transactions: [
      {
        id: 'wtx-01',
        timestamp: Date.now() - 2 * 24 * 3600 * 1000,
        type: 'GLOBAL_EXPORT',
        amountInr: 340,
        description: 'Exported 1 GB to Switzerland RoamPool (Earned ₹340)',
        referenceId: 'BW-GLB-902184',
        status: 'SUCCESS',
      },
      {
        id: 'wtx-02',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000,
        type: 'CASHBACK',
        amountInr: 50,
        description: 'True 5G Unlimited Activation Cashback Bonus',
        referenceId: 'BW-CBK-441029',
        status: 'SUCCESS',
      },
      {
        id: 'wtx-03',
        timestamp: Date.now() - 7 * 24 * 3600 * 1000,
        type: 'TOPUP',
        amountInr: 500,
        description: 'Prepaid Wallet Top-up via UPI (GPay)',
        referenceId: 'BW-TOP-881920',
        status: 'SUCCESS',
      },
    ],
  });

  const topUpProfileWallet = (amountInr: number, method: string) => {
    if (amountInr <= 0) return { success: false, txId: '' };
    const txId = `TOP-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const newTx: WalletTransactionRecord = {
      id: `wtx-${Date.now()}`,
      timestamp: Date.now(),
      type: 'TOPUP',
      amountInr,
      description: `Added ₹${amountInr} to Wallet via ${method}`,
      referenceId: txId,
      status: 'SUCCESS',
    };

    setProfileWallet((prev) => ({
      ...prev,
      telecomCreditBalanceInr: prev.telecomCreditBalanceInr + amountInr,
      transactions: [newTx, ...prev.transactions],
    }));

    setNotifications((prev) => [
      {
        id: `notif-topup-${Date.now()}`,
        title: `Wallet Top-Up Successful!`,
        message: `₹${amountInr} added to your BlueWave Telecom Wallet via ${method}.`,
        timestamp: Date.now(),
        type: 'RECHARGE_SUCCESS',
        read: false,
      },
      ...prev,
    ]);

    return { success: true, txId };
  };

  const toggleAutoRecharge = (enabled: boolean) => {
    setProfileWallet((prev) => ({
      ...prev,
      autoRechargeEnabled: enabled,
    }));
  };

  return (
    <TelecomContext.Provider
      value={{
        userProfile,
        activePlan,
        walletState,
        plans,
        transactions,
        ledger,
        notifications,
        unreadCount,
        isDemoMode,
        language,
        viewMode,
        isMaskedMobile,
        toggleMaskMobile,
        setLanguage,
        setViewMode,
        toggleDemoMode,
        consumeData,
        triggerDailyRollover,
        executeRecharge,
        toggleCarryForward,
        setAllocationOrder,
        switchActiveNumber,
        updatePlanAdmin,
        addPlanAdmin,
        markNotificationsRead,
        dismissNotification,
        p2pListings,
        globalMarkets,
        earningsWallet,
        profileWallet,
        sellDataToGlobalMarket,
        createP2PListing,
        buyPeerListing,
        withdrawEarningsToUPI,
        topUpProfileWallet,
        toggleAutoRecharge,
      }}
    >
      {children}
    </TelecomContext.Provider>
  );
};

export const useTelecom = () => {
  const context = useContext(TelecomContext);
  if (!context) {
    throw new Error('useTelecom must be used within a TelecomProvider');
  }
  return context;
};
