
// --- User & Auth ---
export interface User {
  id: string;
  email: string;
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
  id: string; // CIP's "id" field
  amount: number; // In Kobo from API, converted to Naira in service
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  type: string; // e.g., 'AIRTIME', 'DATA'
  source: string; // e.g., 'AIRTIME', 'CABLE TV'
  remarks: string;
  date_created: string;
  date_updated: string;
  token?: string; // For electricity purchases
}

export interface VerificationResponse {
  status: boolean;
  message: string;
  customerName?: string;
  customerAddress?: string;
  dueDate?: string;
  smartCardNumber?: string;
  meterNumber?: string;
}

// --- API Layer ---
// This represents the raw response from the CIP API via our proxy
export interface CipApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
  errors: { path: string; message: string; code: string }[] | null;
}

// This is the standardized response format our services will return
export interface ApiResponse<T> {
  status: boolean; // true for success, false for error
  message?: string;
  data?: T;
  errors?: string[];
}


// --- UI & State ---
export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
