import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const DEFAULT_MARGINS = { user: 10, reseller: 5, api: 2 };

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
    console.error("Pricing fetch error");
  }
  return DEFAULT_MARGINS.user;
}

function maskProviderError(message: string): string {
  const lowBalanceKeywords = ['insufficient balance', 'balance too low', 'low credit', 'unit exhausted', 'api balance'];
  const lowerMsg = (message || '').toLowerCase();
  if (lowBalanceKeywords.some(keyword => lowerMsg.includes(keyword))) {
    return "Service currently unavailable on this node. Please try an alternative server.";
  }
  return message;
}

async function logTransaction(userId: string, type: TransactionResponse['type'], amount: number, source: string, remarks: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS', server?: string) {
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
      server,
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
  // Server 1 Exclusive: Airtime
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    
    const res = await cipApiClient<TransactionResponse>('airtime', { 
      data: { ...payload, server: 'server1' }, 
      method: 'POST' 
    });
    
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`, 'SUCCESS', 'Server 1');
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  // Dual Server: Data
  getDataPlans: async (payload: { network: string; type: string; server: 'server1' | 'server2' }): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const margin = await getMarginForUser(role);

    const res = await cipApiClient<any[]>(`data/plans?network=${payload.network.toUpperCase()}&type=${payload.type.toUpperCase()}&server=${payload.server}`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ 
        id: p.id || p.code, 
        name: p.name, 
        amount: Number(p.price) + margin,
        validity: p.validity || '30 Days',
        network: payload.network,
        server: payload.server
      }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined, message: maskProviderError(res.message || '') };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string; server: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    
    const res = await cipApiClient<TransactionResponse>('data/purchase', { 
      data: { ...payload }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, 'SUCCESS', payload.server);
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  // Server 2 Exclusive: Electricity & Cable
  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    return cipApiClient<Operator[]>('electricity/providers?server=server2', { method: 'GET' });
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('electricity/verify?server=server2', { data: payload, method: 'POST' });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    
    const res = await cipApiClient<TransactionResponse>('electricity/purchase', { data: { ...payload, server: 'server2' }, method: 'POST' });
    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', 'Server 2');
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const margin = await getMarginForUser(role);

    const res = await cipApiClient<any[]>(`cable/plans?biller=${billerName.toUpperCase()}&server=server2`, { method: 'GET' });
    if (res.status && res.data) {
      const mappedPlans: DataPlan[] = res.data.map(p => ({ 
        id: p.code, 
        name: p.name, 
        amount: Number(p.price) + margin, 
        validity: 'Monthly' 
      }));
      return { ...res, data: mappedPlans };
    }
    return { ...res, data: undefined };
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('cable/verify?server=server2', { data: payload, method: 'POST' });
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required' };
    const res = await cipApiClient<TransactionResponse>('cable/purchase', { data: { ...payload, server: 'server2' }, method: 'POST' });
    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', 'Server 2');
    } else {
      res.message = maskProviderError(res.message || '');
    }
    return res;
  },

  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Unauthenticated' };
    try {
      const txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("date_created", "desc"), limit(50));
      const snapshot = await getDocs(txQuery);
      return { status: true, data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse)) };
    } catch (error) {
      return { status: false, message: "Database sync error" };
    }
  }
};