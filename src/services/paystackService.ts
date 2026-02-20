import { ApiResponse } from '../types';

async function safeFetch<T>(body: any): Promise<ApiResponse<T>> {
  try {
    // Calling the proxy at the direct absolute API path
    const response = await fetch('/api/paystack-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const res = await response.json();
      // In Paystack API responses, 'status' is a boolean
      if (res.status === true) {
        return { status: true, data: res.data };
      } else {
        return { status: false, message: res.message || 'Gateway reported failure' };
      }
    } else {
      const text = await response.text();
      return { status: false, message: `Gateway Protocol Error: ${text.substring(0, 100)}` };
    }
  } catch (e: any) {
    return { status: false, message: e.message || 'Node connectivity failed' };
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