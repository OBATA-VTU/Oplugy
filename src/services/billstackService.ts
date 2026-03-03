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
    try {
      const res = await apiClient<any>('/api/proxy?server=billstack', '', {
        method: 'POST',
        data: {
          endpoint: 'v2/thirdparty/generateVirtualAccount',
          method: 'POST',
          data: {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            bank: payload.bank || 'PALMPAY',
            reference: payload.reference
          }
        }
      });

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
  upgradeAccount: async (payload: { email: string; bvn: string }): Promise<ApiResponse<any>> => {
    try {
      const res = await apiClient<any>('/api/proxy?server=billstack', '', {
        method: 'POST',
        data: {
          endpoint: 'v2/thirdparty/upgradeVirtualAccount',
          method: 'POST',
          data: {
            customer: payload.email,
            bvn: payload.bvn
          }
        }
      });

      if (res.status && res.data?.status) {
        return {
          status: true,
          message: res.data.message || 'Account upgraded successfully.',
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
