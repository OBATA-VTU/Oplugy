import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

export interface BillstackAccount {
  account_number: string;
  account_name: string;
  bank_name: string;
  bank_id: string;
  created_at: string;
}

export interface BillstackResponse {
  reference: string;
  account: BillstackAccount[];
  meta: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const billstackService = {
  /**
   * Generate a virtual account for a user.
   * This calls our proxy which then calls Billstack.
   */
  generateVirtualAccount: async (payload: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    phone: string; 
    bank?: '9PSB' | 'PALMPAY';
    reference: string;
  }): Promise<ApiResponse<BillstackResponse>> => {
    const makeRequest = async (emailToUse: string) => {
      return await apiClient<any>('/api/proxy?server=billstack', '', {
        method: 'POST',
        data: {
          endpoint: 'v2/thirdparty/generateVirtualAccount/',
          method: 'POST',
          data: {
            email: emailToUse,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            bank: payload.bank || 'PALMPAY',
            reference: payload.reference
          }
        }
      });
    };

    try {
      let res = await makeRequest(payload.email);

      // Check for specific Billstack error regarding duplicate email requests
      if (!res.status && res.data?.message?.toLowerCase().includes('multiple requests at a time for same email')) {
        console.warn('Billstack duplicate email error detected. Retrying with a unique random email...');
        
        // Generate a unique random email to bypass the conflict
        const randomString = Math.random().toString(36).substring(2, 10);
        const fallbackEmail = `user_${randomString}_${Date.now()}@oplug.com`;
        
        res = await makeRequest(fallbackEmail);
      }

      if (res.status && res.data?.status) {
        return {
          status: true,
          message: res.data.message || 'Account generated successfully.',
          data: res.data.data
        };
      }

      return {
        status: false,
        message: res.data?.message || res.message || 'Failed to generate virtual account.'
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'An error occurred while generating virtual account.'
      };
    }
  },

  /**
   * Upgrade a virtual account with BVN (KYC).
   */
  upgradeAccount: async (payload: { accountNumber: string; bvn: string }): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient<any>('/api/proxy?server=billstack', '', {
        method: 'POST',
        data: {
          endpoint: 'v2/thirdparty/upgradeVirtualAccount/',
          method: 'POST',
          data: {
            account_number: payload.accountNumber,
            bvn: Number(payload.bvn)
          }
        }
      });

      if (res.status && (res.data?.status === true || res.data?.responseCode === 0 || res.data?.responseCode === "00")) {
        return {
          status: true,
          message: res.data.message || 'Validated',
          data: res.data
        };
      }

      return {
        status: false,
        message: res.data?.message || res.message || 'Failed to upgrade account.'
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'An error occurred while upgrading account.'
      };
    }
  }
};
