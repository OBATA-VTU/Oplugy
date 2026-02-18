
import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole } from '../types';
import { cipApiClient } from './cipApiClient';
import { CABLE_BILLERS } from '../constants';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

// Default Fallback Margins
const DEFAULT_MARGINS = {
  user: 10,
  reseller: 5,
  api: 2
};

async function getMarginForUser(role: UserRole): Promise<number> {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (settingsDoc.exists()) {
      const pricing = settingsDoc.data().pricing;
      if (pricing) {
        if (role === 'reseller') return pricing.reseller_margin ?? DEFAULT_MARGINS.reseller;
        if (role === 'api') return pricing.api_margin ?? DEFAULT_MARGINS.api;
        return pricing.user_margin ?? DEFAULT_MARGINS.user;
      }
    }
  } catch (e) {
    console.error("Pricing fetch error, using defaults");
  }
  return DEFAULT_MARGINS.user;
}

function maskProviderError(message: string): string {
  const lowBalanceKeywords = ['insufficient balance', 'balance too low', 'low credit', 'unit exhausted'];
  const lowerMsg = message.toLowerCase();
  if (lowBalanceKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return "Purchases off by admin contact Admin for further inquiry";
  }
  return message;
}

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
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`);
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  getDataPlans: async (payload: { network: string; type: string }): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const margin = await getMarginForUser(role);

    const res = await cipApiClient<any[]>(`data/plans?network=${payload.network.toUpperCase()}&type=${payload.type.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ 
        ...p, 
        id: p.id, 
        amount: (p.price / 100) + margin,
        network: payload.network 
      }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const res = await cipApiClient<TransactionResponse>('data/plans', { data: { plan_id: payload.plan_id, phone_number: payload.phone_number }, method: 'POST' });
    if (res.status) {
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`);
    } else {
      res.message = maskProviderError(res.message || '');
    }
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
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = (userDoc.data()?.role as UserRole) || 'user';
    const margin = await getMarginForUser(role);
    const finalAmount = payload.amount + margin;

    const res = await cipApiClient<TransactionResponse>('electricity', { data: { ...payload, amount: payload.amount }, method: 'POST' });
    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', finalAmount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`);
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  getCableOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return { status: true, data: CABLE_BILLERS, message: 'Operators fetched.' };
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const margin = await getMarginForUser(role);

    const res = await cipApiClient<any[]>(`tv?biller=${billerName.toUpperCase()}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ 
        id: p.code, 
        name: p.name, 
        amount: (p.price / 100) + margin, 
        validity: 'Varies' 
      }));
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
    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`);
    } else {
      res.message = maskProviderError(res.message || '');
    }
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
      return { status: true, data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse)) };
    } catch (error: any) {
      const txQueryFallback = query(collection(db, "transactions"), where("userId", "==", user.uid), limit(20));
      const snapshot = await getDocs(txQueryFallback);
      return { status: true, data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse)) };
    }
  }
};
