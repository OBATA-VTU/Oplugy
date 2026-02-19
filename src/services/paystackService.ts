import { ApiResponse } from '../types';

export const paystackService = {
  async fetchBanks(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'bank', method: 'GET' })
      });
      const res = await response.json();
      return res.status ? { status: true, data: res.data } : { status: false, message: res.message };
    } catch (e: any) {
      return { status: false, message: e.message };
    }
  },

  async verifyAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: `bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, 
          method: 'GET' 
        })
      });
      const res = await response.json();
      return res.status ? { status: true, data: res.data } : { status: false, message: res.message };
    } catch (e: any) {
      return { status: false, message: e.message };
    }
  }
};