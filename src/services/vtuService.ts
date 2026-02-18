
import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse } from '../types';
import { cipApiClient } from './cipApiClient';
import { AIRTIME_NETWORKS, DATA_NETWORKS, CABLE_BILLERS } from '../constants';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

async function logTransaction(userId: string, type: TransactionResponse['type'], amount: number, source: string, remarks: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS') {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    await addDoc(collection(db, "transactions"), {
      userId: user.uid,
      userEmail: user.email,
      type,
      amount,
      source,
      remarks,
      status,
      date_created: serverTimestamp(),
      date_updated: serverTimestamp()
    });
    
    if (status === 'SUCCESS' && type !== 'FUNDING' && type !== 'REFERRAL') {
      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: increment(-amount)
      });
    }
  } catch (e) {
    console.error("Ledger error:", e);
  }
}

export const vtuService = {
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const res = await cipApiClient<TransactionResponse>('airtime', { data: payload, method: 'POST' });
    if (res.status) await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`);
    return res;
  },

  getDataPlans: async (payload: { network: string; type: string }): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<any[]>(`data/plans?network=${payload.network.toUpperCase()}&type=${payload.type.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ ...p, id: p.id, amount: p.price / 100 }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const res = await cipApiClient<TransactionResponse>('data/plans', { data: { plan_id: payload.plan_id, phone_number: payload.phone_number }, method: 'POST' });
    if (res.status) await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`);
    return res;
  },

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return cipApiClient<{ id: string; name: string }[]>('electricity', { method: 'GET' });
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('electricity/validate', { data: payload, method: 'POST' });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const res = await cipApiClient<TransactionResponse>('electricity', { data: payload, method: 'POST' });
    if (res.status) await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`);
    return res;
  },

  getCableOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return { status: true, data: CABLE_BILLERS, message: 'Operators fetched.' };
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<any[]>(`tv?biller=${billerName.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ id: p.code, name: p.name, amount: p.price / 100, validity: 'Varies' }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('tv/verify', { data: payload, method: 'POST' });
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const apiPayload = { biller: payload.biller, code: payload.planCode, smartCardNumber: payload.smartCardNumber, phoneNumber: payload.phoneNumber, subscriptionType: payload.subscriptionType };
    const res = await cipApiClient<TransactionResponse>('tv', { data: apiPayload, method: 'POST' });
    if (res.status) await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`);
    return res;
  },

  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Unauthenticated' };
    
    try {
      const txQuery = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid),
        orderBy("date_created", "desc"), 
        limit(20)
      );
      const snapshot = await getDocs(txQuery);
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse));
      return { status: true, data: txs };
    } catch (error: any) {
      console.error("History fetch error:", error);
      // Fallback query if indexing is not complete
      const txQueryFallback = query(collection(db, "transactions"), where("userId", "==", user.uid), limit(20));
      const snapshot = await getDocs(txQueryFallback);
      const txs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse));
      return { status: true, data: txs };
    }
  }
};
