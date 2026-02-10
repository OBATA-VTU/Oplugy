
import { User, ApiResponse } from '../types';
import { apiClient } from './apiClient';
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '../constants';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await apiClient<{status: string, message: string, data: any}>(
      '', 
      '/api/auth/login', 
      { data: { email, password }, method: 'POST' }
    );

    if (response.status && response.data?.status === 'success') {
      const { token, user } = response.data.data;
      this.saveSession(token, user);
      return { status: true, data: { token, user }, message: response.data.message };
    }

    return { 
      status: false, 
      message: response.message || 'Login failed',
      errors: response.errors 
    };
  },

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    const response = await apiClient<{status: string, message: string, data: any}>(
      '', 
      '/api/auth/me', 
      { method: 'GET' }
    );

    if (response.status && response.data?.status === 'success') {
      return { status: true, data: response.data.data };
    }

    return { status: false, message: 'Session expired' };
  },

  async signup(payload: any): Promise<ApiResponse<any>> {
    const response = await apiClient<{status: string, message: string, data: any}>(
      '', 
      '/api/auth/signup', 
      { data: payload, method: 'POST' }
    );

    if (response.status && response.data?.status === 'success') {
      return { status: true, message: response.data.message };
    }

    return { status: false, message: response.message || 'Signup failed' };
  },

  saveSession(token: string, user: User): void {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
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
};
