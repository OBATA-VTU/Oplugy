
import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse } from '../types';
import { cipApiClient } from './cipApiClient';
import { AIRTIME_NETWORKS, DATA_NETWORKS, CABLE_BILLERS } from '../constants';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// --- Type definitions for raw CIP API responses ---
interface RawCipDataPlan {
  id: string;
  name: string;
  price: number; // in Kobo
  type?: string;
  size?: string;
  network?: string;
  validity: string;
}

interface RawCipCablePlan {
  name: string;
  price: number; // in Kobo
  code: string;
}

interface RawElectricityVerification {
  name: string;
  meter_number: string;
  address?: string;
}

interface RawCableVerification {
  name: string;
  dueDate: string;
  smartCardNumber: string;
}

export const vtuService = {
  // --- Airtime ---
  getAirtimeOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return { status: true, data: AIRTIME_NETWORKS, message: 'Operators fetched.' };
  },
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const normalizedPayload = {
      ...payload,
      network: payload.network.toUpperCase()
    };
    const res = await cipApiClient<TransactionResponse>('airtime', { data: normalizedPayload, method: 'POST' });
    if (res.data) res.data.amount /= 100; // Kobo to Naira conversion
    return res;
  },

  // --- Data ---
  getDataOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return { status: true, data: DATA_NETWORKS, message: 'Operators fetched.' };
  },
  getDataPlans: async (payload: { network: string; type: string }): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<RawCipDataPlan[]>(`data/plans?network=${payload.network.toUpperCase()}&type=${payload.type.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ ...p, id: p.id, amount: p.price / 100 }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },
  purchaseData: async (payload: { plan_id: string; phone_number: string }): Promise<ApiResponse<TransactionResponse>> => {
    const res = await cipApiClient<TransactionResponse>('data/plans', { data: payload, method: 'POST' });
    if (res.data) res.data.amount /= 100; // Kobo to Naira conversion
    return res;
  },

  // --- Electricity ---
  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return cipApiClient<{ id: string; name: string }[]>('electricity', { method: 'GET' });
  },
  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    const res = await cipApiClient<RawElectricityVerification>('electricity/validate', { data: payload, method: 'POST' });
    if (res.status && res.data) {
      return {
        status: true,
        message: res.message,
        data: {
          status: true,
          message: res.message || 'Verified',
          customerName: res.data.name,
          meterNumber: res.data.meter_number,
          customerAddress: res.data.address,
        },
      };
    }
    return { status: false, message: res.message, data: undefined };
  },
  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const res = await cipApiClient<TransactionResponse>('electricity', { data: payload, method: 'POST' });
    if (res.data) res.data.amount /= 100; // Kobo to Naira conversion
    return res;
  },

  // --- Cable TV ---
  getCableOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return { status: true, data: CABLE_BILLERS, message: 'Operators fetched.' };
  },
  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<RawCipCablePlan[]>(`tv?biller=${billerName.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ id: p.code, name: p.name, amount: p.price / 100, validity: 'Varies' }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },
  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    const res = await cipApiClient<RawCableVerification>('tv/verify', { data: payload, method: 'POST' });
    if (res.status && res.data) {
      return {
        status: true,
        message: res.message,
        data: {
          status: true,
          message: res.message || 'Verified',
          customerName: res.data.name,
          dueDate: res.data.dueDate,
          smartCardNumber: res.data.smartCardNumber,
        },
      };
    }
    return { status: false, message: res.message, data: undefined };
  },
  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string }): Promise<ApiResponse<TransactionResponse>> => {
    const apiPayload = { ...payload, code: payload.planCode };
    const res = await cipApiClient<TransactionResponse>('tv', { data: apiPayload, method: 'POST' });
    if (res.data) res.data.amount /= 100; // Kobo to Naira conversion
    return res;
  },

  // --- Transactions ---
  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Unauthenticated' };
    
    try {
      const txQuery = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        orderBy("date_created", "desc"), 
        limit(10)
      );
      const snapshot = await getDocs(txQuery);
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse));
      return { status: true, data: txs };
    } catch (error: any) {
      return { status: false, message: "Failed to fetch user ledger" };
    }
  }
};
