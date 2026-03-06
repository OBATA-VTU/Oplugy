import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

export const paystackService = {
  async fetchBanks(): Promise<ApiResponse<any[]>> {
    const res = await apiClient<any>('/api/proxy?server=paystack', '', {
      method: 'POST',
      data: { endpoint: 'bank', method: 'GET' }
    });
    if (res.status && res.data?.status === true) {
      return { status: true, data: res.data.data };
    }
    return { status: false, message: res.data?.message || res.message || 'Failed to fetch banks' };
  },

  async verifyAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<any>> {
    const res = await apiClient<any>('/api/proxy?server=paystack', '', {
      method: 'POST',
      data: { 
        endpoint: `bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, 
        method: 'GET' 
      }
    });
    if (res.status && res.data?.status === true) {
      return { status: true, data: res.data.data };
    }
    return { status: false, message: res.data?.message || res.message || 'Failed to verify account' };
  }
};
