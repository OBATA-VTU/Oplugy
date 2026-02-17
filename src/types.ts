
// --- User & Auth ---
export type UserRole = 'user' | 'reseller' | 'api' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  fullName: string;
  walletBalance: number;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  referralCount: number;
  createdAt?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Wallet {
  balance: number;
}

// --- VTU Services ---
export interface Operator {
  id: string;
  name: string;
  image?: string;
}

export interface DataPlan {
  id: string; // plan_id or code
  name: string;
  amount: number; // Stored in Naira
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
  date_created: string;
  date_updated: string;
  token?: string; 
}

// --- Verification & API Structure ---
/**
 * Standardized response for electricity and cable verification.
 */
export interface VerificationResponse {
  status: boolean;
  message?: string;
  customerName: string;
  meterNumber?: string;
  customerAddress?: string;
  dueDate?: string;
  smartCardNumber?: string;
}

/**
 * Standardized response for Oplug internal API requests.
 */
export interface ApiResponse<T> {
  status: boolean; 
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Raw response structure from the CIP Topup provider API.
 */
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
