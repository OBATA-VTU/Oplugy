import { ApiResponse } from '../types';

async function safeFetch<T>(body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch('/api/paystack-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const res = await response.json();
      if (res.status === true) {
        return { status: true, data: res.data };
      } else {
        return { status: false, message: res.message || 'Gateway reported failure' };
      }
    } else {
      return { status: false, message: `Gateway error: 404 Node Not Found or Protocol Error.` };
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