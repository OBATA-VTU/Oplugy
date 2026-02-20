import { ApiResponse } from '../types';

async function safeFetch<T>(body: any): Promise<ApiResponse<T>> {
  try {
    // Calling the proxy file directly to avoid Vercel rewrite issues in certain environments
    const response = await fetch('/api/paystack-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const res = await response.json();
      // Paystack usually returns { status: true, data: ... }
      return res.status ? { status: true, data: res.data } : { status: false, message: res.message || 'Gateway reported error' };
    } else {
      const text = await response.text();
      return { status: false, message: `Gateway error: ${text.substring(0, 100)}` };
    }
  } catch (e: any) {
    return { status: false, message: e.message || 'Network connectivity failed' };
  }
}

export const paystackService = {
  async fetchBanks(): Promise<ApiResponse<any[]>> {
    return safeFetch<any[]>({ path: 'bank', method: 'GET' });
  },

  async verifyAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<any>> {
    return safeFetch<any>({ 
      path: `bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, 
      method: 'GET' 
    });
  }
};