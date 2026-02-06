import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse } from '../types';
import { cipApiClient } from './cipApiClient'; // Use the CIP specific API client
// Fix: Import the specific constants for operators from constants.ts
import { AIRTIME_NETWORKS, DATA_NETWORKS, CABLE_BILLERS } from '../constants.ts'; // Import hardcoded lists for operators

export const vtuService = {
  // --- Airtime Services ---
  async getAirtimeOperators(): Promise<ApiResponse<Operator[]>> {
    // CIP API does not have an explicit endpoint to get airtime operators.
    // We will return a hardcoded list of supported networks.
    return { status: true, data: AIRTIME_NETWORKS, message: 'Airtime operators fetched successfully.' };
  },

  async purchaseAirtime(payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> {
    // CIP API expects amount in Naira in the request
    const response = await cipApiClient<TransactionResponse>('airtime', { data: payload, method: 'POST' });
    if (response.status && response.data) {
      // Convert amount from Kobo to Naira for display
      response.data.amount /= 100;
    }
    return response;
  },

  // --- Data Services ---
  async getDataOperators(): Promise<ApiResponse<Operator[]>> {
    // CIP API does not have an explicit endpoint to get data operators.
    // We will return a hardcoded list of supported networks.
    return { status: true, data: DATA_NETWORKS, message: 'Data operators fetched successfully.' };
  },

  async getDataPlans(payload: { network: string; type: string }): Promise<ApiResponse<DataPlan[]>> {
    interface RawCipDataPlan {
      id: string;
      name: string;
      price: number; // CIP returns price in Kobo
      type?: string;
      size?: string;
      network?: string;
      validity: string;
    }

    const cipResponse = await cipApiClient<RawCipDataPlan[]>(
      `data/plans?network=${payload.network.toUpperCase()}&type=${payload.type.toUpperCase()}`,
      { method: 'GET' }
    );

    if (cipResponse.status && cipResponse.data) {
      const mappedDataPlans: DataPlan[] = cipResponse.data.map(plan => ({
        id: plan.id,
        name: plan.name,
        amount: plan.price / 100, // Convert price from Kobo to Naira
        validity: plan.validity,
        type: plan.type,
        size: plan.size,
        network: plan.network,
      }));
      return { ...cipResponse, data: mappedDataPlans };
    }
    return { ...cipResponse, data: undefined };
  },

  async purchaseData(payload: { plan_id: string; phone_number: string }): Promise<ApiResponse<TransactionResponse>> {
    const response = await cipApiClient<TransactionResponse>('data/plans', { data: payload, method: 'POST' });
    if (response.status && response.data) {
      response.data.amount /= 100;
    }
    return response;
  },

  // --- Electricity Bills Services ---
  async getElectricityOperators(): Promise<ApiResponse<Operator[]>> {
    const response = await cipApiClient<{ id: string; name: string }[]>('electricity', { method: 'GET' });
    return response as ApiResponse<Operator[]>;
  },

  async verifyElectricityMeter(payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> {
    interface RawVerificationResponse {
      name: string;
      meter_number: string;
    }
    
    const response = await cipApiClient<RawVerificationResponse>('electricity/validate', { data: payload, method: 'POST' });
    
    // CORRECTED: Simplified response mapping to avoid nesting.
    if (response.status && response.data) {
      return {
        status: true,
        message: response.message || 'Meter verified',
        data: {
          status: true,
          message: response.message || 'Meter verified',
          customerName: response.data.name,
          meterNumber: response.data.meter_number,
        },
      };
    }
    return { status: false, message: response.message || 'Verification failed.', data: undefined };
  },

  async purchaseElectricity(payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> {
    const response = await cipApiClient<TransactionResponse & { token?: string }>(
      'electricity',
      { data: payload, method: 'POST' }
    );
    if (response.status && response.data) {
      response.data.amount /= 100;
    }
    return response;
  },

  // --- Cable TV Services ---
  async getCableOperators(): Promise<ApiResponse<Operator[]>> {
    return { status: true, data: CABLE_BILLERS, message: 'Cable operators fetched successfully.' };
  },

  async getCablePlans(billerName: string): Promise<ApiResponse<DataPlan[]>> {
    interface RawCipCablePlan {
      name: string;
      price: number; // CIP returns price in Kobo
      code: string;
    }

    const cipResponse = await cipApiClient<RawCipCablePlan[]>(`tv?biller=${billerName.toUpperCase()}`, { method: 'GET' });

    if (cipResponse.status && cipResponse.data) {
      const mappedCablePlans: DataPlan[] = cipResponse.data.map(plan => ({
        id: plan.code,
        name: plan.name,
        amount: plan.price / 100, // Convert price from Kobo to Naira
        validity: 'Monthly', // Set a default validity
      }));
      return { ...cipResponse, data: mappedCablePlans };
    }
    return { ...cipResponse, data: undefined };
  },

  async verifyCableSmartcard(payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> {
    interface RawVerificationResponse {
        name: string;
        dueDate: string;
        smartCardNumber: string;
    }
    const response = await cipApiClient<RawVerificationResponse>('tv/verify', { data: payload, method: 'POST' });
    
    // CORRECTED: Simplified response mapping to avoid nesting.
    if (response.status && response.data) {
      return {
        status: true,
        message: response.message || 'Smartcard verified',
        data: {
          status: true,
          message: response.message || 'Smartcard verified',
          customerName: response.data.name,
          dueDate: response.data.dueDate,
          smartCardNumber: response.data.smartCardNumber,
        },
      };
    }
    return { status: false, message: response.message || 'Verification failed.', data: undefined };
  },

  async purchaseCable(payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string }): Promise<ApiResponse<TransactionResponse>> {
    const response = await cipApiClient<TransactionResponse>('tv', { data: payload, method: 'POST' });
    if (response.status && response.data) {
      response.data.amount /= 100;
    }
    return response;
  },
};
