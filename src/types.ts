export interface User {
  id: string;
  email: string;
  // Add other user properties as needed from the API
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Wallet {
  balance: number;
}

export interface Operator {
  id: string; // Changed to string to accommodate CIP's string IDs (e.g., "ikeja-electric", "AIRTEL")
  name: string;
  image?: string; // URL to operator logo, optional as not always provided by CIP
}

export interface DataPlan {
  id: string; // Changed to string (e.g., "AIRTEL_150MB_AWOOF_DAILY", "gotv-lite")
  name: string;
  amount: number; // Stored in Naira, converted from Kobo price in API response
  validity: string;
  // Additional fields from CIP Data Plans
  type?: string; // e.g., AWOOF, GIFTING, SME, DATASHARE
  size?: string; // e.g., 0.15
  network?: string; // e.g., AIRTEL
}

export interface TransactionResponse {
  reference: string; // CIP's "id" field
  amount: number; // CIP's "amount" field, which is in Kobo. Will be converted to Naira in UI.
  status: string; // e.g., SUCCESS, PENDING, FAILED
  message?: string; // CIP's "message" field
  token?: string; // For electricity purchases
  // Add other transaction details as needed from CIP response (type, source, remarks, date_created, date_updated)
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: boolean; // Renamed from CIP's "status": "success"/"error" to boolean for consistency
  errors?: string[];
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface VerificationResponse {
  status: boolean; // CIP's "status": "success"/"error"
  message: string;
  customerName?: string; // For meter or smartcard verification (CIP's 'name' field)
  customerAddress?: string; // For meter verification (CIP doesn't provide, will be N/A)
  customerInfo?: string; // Generic customer info (CIP's 'name' or any other relevant info)
  dueDate?: string; // For cable TV verification
  smartCardNumber?: string; // For cable TV verification
  meterNumber?: string; // For electricity verification
}