import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

async function getSystemConfig() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    return settingsDoc.exists() ? settingsDoc.data() : { pricing: { user_margin: 10, server1: { data_margin: 10 } } };
  } catch (e) {
    return { pricing: { user_margin: 10, server1: { data_margin: 10 } } };
  }
}

async function getManualPrice(planId: string, role: UserRole): Promise<number | null> {
  try {
    const priceDoc = await getDoc(doc(db, "manual_pricing", planId));
    if (priceDoc.exists()) {
      const prices = priceDoc.data();
      const priceKey = `${role}_price`;
      return Number(prices[priceKey] || prices.user_price);
    }
  } catch (e) {
    console.warn(`Manual price sync skipped for ${planId}`);
  }
  return null;
}

async function logTransaction(userId: string, type: TransactionResponse['type'], amount: number, source: string, remarks: string, status: 'SUCCESS' | 'PENDING' | 'FAILED' = 'SUCCESS', server?: string) {
  try {
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, "transactions"), {
      userId: user.uid,
      userEmail: user.email,
      type,
      amount: Number(amount),
      source,
      remarks,
      status,
      server: server || 'Main Node',
      date_created: serverTimestamp(),
      date_updated: serverTimestamp()
    });
    if (status !== 'FAILED' && type !== 'FUNDING' && type !== 'REFERRAL') {
      await updateDoc(doc(db, "users", user.uid), { walletBalance: increment(-Number(amount)) });
    }
  } catch (e) { console.error("History log fail:", e); }
}

export const vtuService = {
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };

    const res = await cipApiClient<any>('airtime', { 
      data: { ...payload, mobileNumber: payload.phone, server: 'server1' }, 
      method: 'POST' 
    });
    
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`, 'SUCCESS', 'Main Node');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getDataCategories: async (network: string): Promise<ApiResponse<string[]>> => {
    try {
      const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
      if (res.status && res.data?.dataPlans) {
        const plans = res.data.dataPlans as any[];
        const categories = Array.from(new Set(
          plans
            .filter(p => p.network && p.network.toUpperCase() === network.toUpperCase())
            .map(p => p.dataType)
        )).filter(c => !!c);
        return { status: true, data: categories };
      }
    } catch (e) { console.error("Category fetch error:", e); }
    return { status: false, message: 'Node synchronization failed.' };
  },

  getDataPlans: async (payload: { network: string; type: string; userRole?: UserRole }): Promise<ApiResponse<DataPlan[]>> => {
    const role = payload.userRole || 'user';
    const config = await getSystemConfig();
    
    try {
      const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
      if (res.status && res.data?.dataPlans) {
        const rawPlans = (res.data.dataPlans || []) as any[];
        const filtered = rawPlans.filter((p: any) => 
          p.network && p.network.toUpperCase() === payload.network.toUpperCase() && 
          (payload.type === '' || (p.dataType && p.dataType.toUpperCase() === payload.type.toUpperCase()))
        );

        const plans: DataPlan[] = [];
        for (const p of filtered) {
          const planId = String(p.serviceID);
          const manual = await getManualPrice(planId, role);
          const rawBase = Number(String(p.amount).replace(/,/g, ''));
          const margin = config.pricing?.server1?.data_margin ?? 10;
          
          plans.push({
            id: planId,
            name: `${p.dataPlan} ${p.dataType}`,
            amount: manual || (rawBase + margin), 
            validity: p.validity
          });
        }
        return { status: true, data: plans };
      }
    } catch (e: any) {
      return { status: false, message: 'Main node unreachable.' };
    }
    return { status: false, message: 'No valid plans returned by node.' };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    
    const res = await cipApiClient<any>('data', { 
      data: { 
        plan_id: payload.plan_id, 
        phone_number: payload.phone_number,
        server: 'server1' 
      }, 
      method: 'POST' 
    });

    if (res.status) {
      const apiStatus = res.data?.status === 'PENDING' ? 'PENDING' : 'SUCCESS';
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, apiStatus, 'Main Node');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
    if (res.status && res.data?.electricity) {
        const operators = (res.data.electricity || []).map((e: any) => ({ 
          id: String(e.serviceID), 
          name: e.disco 
        }));
        return { status: true, data: operators };
    }
    return { status: false, message: 'Utility node offline.' };
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('validatemeter', { 
      data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2, server: 'server1' }, 
      method: 'POST' 
    });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };

    const res = await cipApiClient<any>('payelectric', { 
      data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2, amount: payload.amount, server: 'server1' }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', 'Main Node');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
    if (res.status && res.data?.cablePlans) {
        const filtered = (res.data.cablePlans || []).filter((c: any) => c.cable.toUpperCase() === billerName.toUpperCase());
        return { 
          status: true, 
          data: filtered.map((p: any) => ({
            id: String(p.serviceID),
            name: p.cablePlan,
            amount: Number(String(p.amount).replace(/,/g, '')),
            validity: 'Monthly'
          }))
        };
    }
    return { status: false, message: 'Cable node offline.' };
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('validatecable', { 
      data: { serviceID: payload.biller, iucNum: payload.smartCardNumber, server: 'server1' }, 
      method: 'POST' 
    });
  },

  purchaseCable: async (payload: { planCode: string; smartCardNumber: string; amount: number; plan_name: string; biller: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };

    const res = await cipApiClient<any>('subcable', { 
      data: { serviceID: payload.planCode, iucNum: payload.smartCardNumber, server: 'server1' }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', 'Main Node');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  purchaseEducation: async (payload: { type: string; quantity: number; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    
    const res = await cipApiClient<any>('education', { 
      data: { serviceID: payload.type, quantity: payload.quantity, server: 'server1' }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'EDUCATION', payload.amount, `Exam PIN`, `Quantity: ${payload.quantity}`, 'SUCCESS', 'Main Node');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    try {
      const txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("date_created", "desc"), limit(50));
      const snapshot = await getDocs(txQuery);
      return { status: true, data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse)) };
    } catch (error) { return { status: false, message: "History ledger offline." }; }
  }
};