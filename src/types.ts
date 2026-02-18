
// --- User & Auth ---
export type UserRole = 'user' | 'reseller' | 'api' | 'admin';
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
}

export interface TierPricing {
  user_margin: number;
  reseller_margin: number;
  api_margin: number;
}

export interface GlobalSettings {
  announcement: string;
  maintenance: boolean;
  apiMode: 'LIVE' | 'TEST';
  pricing: TierPricing;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// --- VTU Services ---
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
}

export interface TransactionResponse {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number; 
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  type: 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'FUNDING' | 'REFERRAL';
  source: string;
  remarks: string;
  date_created: any; 
  date_updated: any;
  token?: string; 
}

// --- Verification & API Structure ---
export interface VerificationResponse {
  status: boolean;
  message?: string;
  customerName: string;
  meterNumber?: string;
  customerAddress?: string;
  dueDate?: string;
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
  message?: string;
  data?: T;
  errors?: Array<{ path: string; message: string }>;
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
