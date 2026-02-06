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

  // Removed verifyAirtimeNumber as CIP API doesn't have a dedicated endpoint for it
  // The verification will happen implicitly on purchase, and for dev, via the test phone number.

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
    // Define the type of the raw data from CIP API for data plans
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
      `data/plans?network=${payload.network}&type=${payload.type}`,
      { method: 'GET' }
    );

    if (cipResponse.status && cipResponse.data) {
      // Map the CIP data plans to our internal DataPlan interface
      const mappedDataPlans: DataPlan[] = cipResponse.data.map(plan => ({
        id: plan.id, // CIP plan ID is a string, keep as is
        name: plan.name,
        amount: plan.price / 100, // Convert price from Kobo to Naira
        validity: plan.validity,
        type: plan.type,
        size: plan.size,
        network: plan.network,
      }));
      // Return a new ApiResponse object with the correctly typed data
      return { ...cipResponse, data: mappedDataPlans };
    }
    // If the original response was not successful or had no data,
    // ensure the 'data' property is correctly typed as undefined.
    return { ...cipResponse, data: undefined };
  },

  // Removed verifyDataNumber as CIP API doesn't have a dedicated endpoint for it

  async purchaseData(payload: { plan_id: string; phone_number: string }): Promise<ApiResponse<TransactionResponse>> {
    const response = await cipApiClient<TransactionResponse>('data/plans', { data: payload, method: 'POST' });
    if (response.status && response.data) {
      // Convert amount from Kobo to Naira for display
      response.data.amount /= 100;
    }
    return response;
  },

  // --- Electricity Bills Services ---
  async getElectricityOperators(): Promise<ApiResponse<Operator[]>> {
    const response = await cipApiClient<{ id: string; name: string }[]>('electricity', { method: 'GET' });
    // CIP's electricity response directly maps to our Operator interface
    return response as ApiResponse<Operator[]>;
  },

  async verifyElectricityMeter(payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> {
    const response = await cipApiClient<{ name: string; meter_number: string }>(
      'electricity/validate',
      { data: payload, method: 'POST' }
    );
    if (response.status && response.data) {
      return {
        status: true,
        message: 'Meter number validated',
        data: {
          status: true,
          message: 'Meter number validated',
          customerName: response.data.name,
          meterNumber: response.data.meter_number,
          // CIP API doesn't provide customerAddress here, so we'll leave it undefined or set N/A in UI
        },
      };
    }
    return { status: false, message: response.message || 'Verification failed.' };
  },

  async purchaseElectricity(payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> {
    // CIP API expects amount in Naira in the request
    const response = await cipApiClient<TransactionResponse & { token?: string }>(
      'electricity',
      { data: payload, method: 'POST' }
    );
    if (response.status && response.data) {
      // Convert amount from Kobo to Naira for display
      response.data.amount /= 100;
    }
    return response;
  },

  // --- Cable TV Services ---
  async getCableOperators(): Promise<ApiResponse<Operator[]>> {
    // CIP API implies billers are fixed.
    return { status: true, data: CABLE_BILLERS, message: 'Cable operators fetched successfully.' };
  },

  async getCablePlans(billerName: string): Promise<ApiResponse<DataPlan[]>> {
    // Define the type of the raw data from CIP API for cable plans
    interface RawCipCablePlan {
      name: string;
      price: number; // CIP returns price in Kobo
      code: string; // Used as ID
    }

    const cipResponse = await cipApiClient<RawCipCablePlan[]>(
      `tv?biller=${billerName}`,
      { method: 'GET' }
    );

    if (cipResponse.status && cipResponse.data) {
      // Map CIP's structure to DataPlan, converting price from Kobo to Naira
      const mappedCablePlans: DataPlan[] = cipResponse.data.map(plan => ({
        id: plan.code, // Use code as the unique ID for the plan
        name: plan.name,
        amount: plan.price / 100, // Convert price from Kobo to Naira
        validity: '30 Days', // CIP response doesn't always provide validity, assume 30 days for now
      }));
      // Return a new ApiResponse object with the correctly typed data
      return { ...cipResponse, data: mappedCablePlans };
    }
    // If the original response was not successful or had no data,
    // ensure the 'data' property is correctly typed as undefined.
    return { ...cipResponse, data: undefined };
  },

  async verifyCableSmartcard(payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> {
    const response = await cipApiClient<{ name: string; dueDate: string; smartCardNumber: string }>(
      'tv/verify',
      { data: payload, method: 'POST' }
    );
    if (response.status && response.data) {
      return {
        status: true,
        message: 'Smartcard verified',
        data: {
          status: true,
          message: 'Smartcard verified',
          customerName: response.data.name,
          dueDate: response.data.dueDate,
          smartCardNumber: response.data.smartCardNumber,
        },
      };
    }
    return { status: false, message: response.message || 'Verification failed.' };
  },

  async purchaseCable(payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string }): Promise<ApiResponse<TransactionResponse>> {
    const response = await cipApiClient<TransactionResponse>(
      'tv',
      { data: payload, method: 'POST' }
    );
    if (response.status && response.data) {
      // Convert amount from Kobo to Naira for display
      response.data.amount /= 100;
    }
    return response;
  },
};