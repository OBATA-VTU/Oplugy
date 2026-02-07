
import { AuthResponse, User, Wallet, ApiResponse } from '../types';
import { apiClient } from './apiClient';
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY, OPLUG_API_BASE_URL } from '../constants';

interface LoginPayload {
  email: string;
  password: string;
}

interface SignUpPayload extends LoginPayload {
  // You can add more fields like name, phone_number here if the backend requires it
}

export const authService = {
  async login(credentials: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient<AuthResponse>(OPLUG_API_BASE_URL, 'auth/login', { data: credentials, method: 'POST' });

    if (response.status && response.data) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.data.token);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(response.data.user));
    }
    return response;
  },

  async signup(credentials: SignUpPayload): Promise<ApiResponse<AuthResponse>> {
    // Assuming a '/auth/register' endpoint. This might need to be adjusted based on the actual backend API.
    const response = await apiClient<AuthResponse>(OPLUG_API_BASE_URL, 'auth/register', { data: credentials, method: 'POST' });

    // Automatically log in the user upon successful registration
    if (response.status && response.data) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.data.token);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(response.data.user));
    }
    return response;
  },

  logout(): void {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
  },

  getUser(): User | null {
    const user = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  async getWalletBalance(): Promise<ApiResponse<Wallet>> {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    // FIX: Ensure the token is `string | undefined`, not `string | null`.
    return apiClient<Wallet>(OPLUG_API_BASE_URL, 'user/wallet', { method: 'GET', token: token || undefined });
  },
};
