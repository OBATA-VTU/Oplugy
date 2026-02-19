import { ApiResponse } from '../types';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';

export const paystackService = {
  async fetchBanks(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch('https://api.paystack.co/bank', {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      });
      const res = await response.json();
      return res.status ? { status: true, data: res.data } : { status: false, message: res.message };
    } catch (e: any) {
      return { status: false, message: e.message };
    }
  },

  async verifyAccount(accountNumber: string, bankCode: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      });
      const res = await response.json();
      return res.status ? { status: true, data: res.data } : { status: false, message: res.message };
    } catch (e: any) {
      return { status: false, message: e.message };
    }
  }
};