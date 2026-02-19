// --- User & Auth ---
export type UserRole = 'user' | 'reseller' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  walletBalance: number;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  referralCount: number;
  createdAt?: any;
  isPinSet: boolean;
  transactionPin?: string;
  webhookUrl?: string;
  apiKey?: string;
}

export interface ManualPrice {
  planId: string;
  user_price: number;
  reseller_price: number;
  api_price: number;
  updatedAt?: any;
}

export interface ServiceRouting {
  airtime: 'server1' | 'server2';
  data: 'server1' | 'server2';
  bills: 'server1' | 'server2';
  cable: 'server1' | 'server2';
  education: 'server1' | 'server2';
}

export interface GlobalSettings {
  announcement: string;
  maintenance: boolean;
  apiMode: 'LIVE' | 'TEST';
  pricing: {
    user_margin: number;
    reseller_margin: number;
    api_margin: number;
  };
  routing: ServiceRouting;
}

export interface Operator {
  id: string;
  name: string;
  image?: string;
}

export interface DataPlan {
  id: string; 
  name: string;
  amount: number; 
  validity: string;
  type?: string;
  size?: string;
  network?: string;
  server?: 'server1' | 'server2';
}

export interface TransactionResponse {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number; 
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  type: 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'FUNDING' | 'REFERRAL' | 'EDUCATION';
  source: string;
  remarks: string;
  date_created: any; 
  date_updated: any;
  token?: string; 
  server?: string;
}

export interface VerificationResponse {
  status: boolean;
  message?: string;
  customerName: string;
  meterNumber?: string;
  customerAddress?: string;
  smartCardNumber?: string;
}

export interface ApiResponse<T> {
  status: boolean; 
  message?: string;
  data?: T;
  errors?: string[];
}

export interface CipApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  errors?: Array<{ path: string; message: string }>;
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}