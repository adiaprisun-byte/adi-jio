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
} from '../types/telecom';
import {
  createInitialWalletState,
  CarryForwardEngine,
  ONE_MB,
  ONE_GB,
  formatBytes,
} from '../engine/CarryForwardEngine';
import { INITIAL_PLANS } from '../data/plansCatalog';

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
