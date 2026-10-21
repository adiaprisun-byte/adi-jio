/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BlueWave Telecom Domain Types
 * Strict integer byte units for data balance accounting.
 */

export type PlanCategory =
  | 'POPULAR'
  | 'TRUE_5G'
  | 'YOUTH_GAMING'
  | 'TRUE_UNLIMITED_UPGRADE'
  | 'ENTERTAINMENT'
  | 'ANNUAL'
  | 'DATA_PACKS'
  | 'INTERNATIONAL_ROAMING'
  | 'ISD'
  | 'IN_FLIGHT'
  | 'WIFI_CALLING'
  | 'TOPUP_VOUCHER'
  | 'VALUE';

export interface OTTBenefit {
  id: string;
  name: string;
  logo: string; // SVG icon identifier or badge
  description: string;
}

export interface RechargePlan {
  id: string;
  name: string;
  price: number; // in INR (₹)
  validityDays: number;
  dailyDataBytes?: number; // 0 or undefined for lump-sum plans
  totalDataBytes?: number; // for booster / lump sum
  is5GEligible: boolean;
  voice: string; // e.g., "Truly Unlimited Calls"
  sms: string; // e.g., "100 SMS/day"
  category: PlanCategory;
  categoryName: string;
  ottBenefits: OTTBenefit[];
  carryForwardEligible: boolean;
  description: string;
  tags: string[]; // e.g. ["2 GB/day", "5G Plans", "28-day plans", "Popular"]
  extraDataBytes?: number; // bonus promotional data
  isDemoData: boolean;
}

export type LedgerEventType =
  | 'ISSUANCE'
  | 'USAGE'
  | 'ROLLOVER'
  | 'EXPIRY'
  | 'ADJUSTMENT'
  | 'ADD_ON'
  | 'DATA_SOLD'
  | 'DATA_BOUGHT';

export interface LedgerEntry {
  id: string;
  timestamp: number; // epoch ms
  type: LedgerEventType;
  amountBytes: number; // always positive integer
  previousDailyBytes: number;
  newDailyBytes: number;
  previousCarryForwardBytes: number;
  newCarryForwardBytes: number;
  description: string;
  idempotencyKey?: string;
  dayNumber: number; // simulated day index
}

export interface P2PListing {
  id: string;
  sellerName: string;
  sellerMaskedMobile: string;
  amountBytes: number;
  priceInr: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdTimestamp: number;
  expiresTimestamp: number;
  verifiedNetwork: string; // e.g. "BlueWave 5G"
  isOwnListing?: boolean;
}

export interface GlobalCountryMarket {
  id: string;
  countryName: string;
  countryCode: string;
  flag: string;
  typicalRetailCostUsdPerGb: number;
  payoutInrPerGb: number;
  payoutUsdEquivalent: number;
  demandStatus: 'Critical Demand' | 'High Demand' | 'Surge Pricing';
  activeRoamersCount: number;
  description: string;
}

export interface P2PTradeRecord {
  id: string;
  timestamp: number;
  type: 'SELL_DOMESTIC' | 'SELL_GLOBAL' | 'BUY_PEER';
  amountBytes: number;
  amountInr: number;
  counterparty: string;
  countryOrPeer: string;
  status: 'COMPLETED' | 'PROCESSING';
  payoutMethod: string;
}

export interface WalletTransactionRecord {
  id: string;
  timestamp: number;
  type: 'TOPUP' | 'WITHDRAWAL' | 'DATA_SALE' | 'GLOBAL_EXPORT' | 'RECHARGE_PAYMENT' | 'CASHBACK';
  amountInr: number;
  description: string;
  referenceId: string;
  status: 'SUCCESS' | 'PROCESSING';
}

export interface TelecomProfileWallet {
  cashBalanceInr: number;
  telecomCreditBalanceInr: number;
  autoRechargeEnabled: boolean;
  linkedUpiVpa: string;
  tierStatus: 'BlueWave Signature Diamond' | 'Platinum Member';
  transactions: WalletTransactionRecord[];
}

export interface UserEarningsWallet {
  cashBalanceInr: number;
  totalEarnedInr: number;
  totalDataSoldBytes: number;
  totalDataBoughtBytes: number;
  payoutUpiId: string;
  recentTrades: P2PTradeRecord[];
}

export interface CarryForwardBucket {
  id: string;
  sourceDate: string; // YYYY-MM-DD
  initialBytes: number;
  remainingBytes: number;
  expiryTimestamp: number; // epoch ms
  isExpired: boolean;
}

export interface SmartDataWalletState {
  // Authoritative integer bytes
  dailyQuotaBytes: number; // e.g. 2 GB = 2,147,483,648
  dailyUsedBytes: number;  // e.g. 1.25 GB
  dailyRemainingBytes: number; // dailyQuotaBytes - dailyUsedBytes

  carryForwardBalanceBytes: number; // total active saved data
  buckets: CarryForwardBucket[];

  totalEligibleDataBytes: number; // dailyRemainingBytes + carryForwardBalanceBytes
  
  // Policies & Settings
  isCarryForwardEnabled: boolean;
  allocationOrder: 'DAILY_FIRST' | 'CARRY_FORWARD_FIRST';
  maxCarryForwardCapacityBytes: number; // e.g. 10 GB limit
  expiryDays: number; // default 7 days rollover validity

  // Simulation day counter
  currentSimulatedDay: number;
  lastResetTimestamp: number;
  renewalTimeStr: string; // e.g. "Today, 11:59 PM"
}

export interface UserProfile {
  name: string;
  mobileNumber: string; // e.g. "+91 98765 43210"
  maskedMobile: string; // e.g. "+91 98••• ••210"
  circle: string; // e.g. "Mumbai & Maharashtra"
  simType: '5G eSIM' | 'Physical 5G Nano SIM';
  accountStatus: 'Active' | 'Grace Period' | 'Suspended';
  is5GDeviceDetected: boolean;
  linkedNumbers: Array<{
    name: string;
    number: string;
    type: 'Prepaid Mobile' | 'Fiber Broadband' | 'Family Add-on';
    balance: string;
  }>;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'PAY_LATER';

export interface PaymentTransaction {
  id: string;
  timestamp: number;
  planId: string;
  planName: string;
  amount: number;
  method: PaymentMethod;
  upiApp?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  referenceNumber: string;
  gstNumber: string;
  invoiceNumber: string;
  paymentDetails: string;
  validityDays: number;
  carryForwardEligible: boolean;
}

export interface TelecomNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'DATA_SAVED' | 'EXPIRY_WARNING' | 'RECHARGE_SUCCESS' | '5G_PROMO';
  read: boolean;
}
