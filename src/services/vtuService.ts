import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole, ServiceRouting } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const DEFAULT_ROUTING: ServiceRouting = {
  airtime: 'server1',
  data: 'server1',
  bills: 'server1',
  cable: 'server2',
  education: 'server1'
};

async function getSystemConfig() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    return settingsDoc.exists() ? settingsDoc.data() : { pricing: { user_margin: 10 }, routing: DEFAULT_ROUTING };
  } catch (e) {
    return { pricing: { user_margin: 10 }, routing: DEFAULT_ROUTING };
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
    console.warn(`Could not fetch manual price for ${planId}`);
  }
  return null;
}

async function logTransaction(userId: string, type: TransactionResponse['type'], amount: number, source: string, remarks: string, status: 'SUCCESS' | 'FAILED' = 'SUCCESS', server?: string) {
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
      server,
      date_created: serverTimestamp(),
      date_updated: serverTimestamp()
    });
    if (status === 'SUCCESS' && type !== 'FUNDING' && type !== 'REFERRAL') {
      await updateDoc(doc(db, "users", user.uid), { walletBalance: increment(-Number(amount)) });
    }
  } catch (e) { console.error("History log fail:", e); }
}

export const vtuService = {
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.airtime || 'server1';
    const serverName = server === 'server1' ? 'Omega Server' : 'Boom Server';

    const res = await cipApiClient<any>(server === 'server1' ? 'airtime' : 'airtime/purchase', { 
      data: { ...payload, mobileNumber: payload.phone, server }, 
      method: 'POST' 
    });
    
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`, 'SUCCESS', serverName);
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getDataCategories: async (network: string, server: 'server1' | 'server2'): Promise<ApiResponse<string[]>> => {
    try {
      if (server === 'server1') {
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
      } else {
        const res = await cipApiClient<any[]>(`data/categories?network=${network}`, { method: 'GET', data: { server: 'server2' } });
        if (res.status && Array.isArray(res.data)) {
          const categories = res.data.map((cat: any) => typeof cat === 'object' ? cat.name : String(cat));
          return { status: true, data: categories };
        }
      }
    } catch (e) {
      console.error("Category fetch error:", e);
    }
    return { status: false, message: 'Could not synchronize categories from node.' };
  },

  getDataPlans: async (payload: { network: string; type: string; server?: 'server1' | 'server2'; userRole?: UserRole }): Promise<ApiResponse<DataPlan[]>> => {
    const server = payload.server || 'server1';
    const role = payload.userRole || 'user';
    const config = await getSystemConfig();
    
    try {
      if (server === 'server1') {
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
            // Non-blocking manual price check
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
      } else {
        const res = await cipApiClient<any[]>(`data/plans`, { 
          method: 'GET', 
          data: { network: payload.network, type: payload.type, server: 'server2' } 
        });
        if (res.status && Array.isArray(res.data)) {
          const margin = config.pricing?.server2?.data_margin ?? 10;
          const plans = res.data.map((p: any) => ({
            id: String(p.id || p.code),
            name: p.name,
            amount: Number(String(p.price || p.amount || 0).replace(/,/g, '')) + margin,
            validity: p.validity || '30 Days'
          }));
          return { status: true, data: plans };
        }
      }
    } catch (e: any) {
      console.error("Plan fetch fatal error:", e);
      return { status: false, message: e.message || 'Node failed to return plan listings.' };
    }
    return { status: false, message: 'Synchronization completed but no valid plans were found.' };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string; server: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const serverName = payload.server === 'server1' ? 'Omega Server' : 'Boom Server';
    
    const endpoint = payload.server === 'server1' ? 'data' : 'data/purchase';
    const res = await cipApiClient<any>(endpoint, { 
      data: { ...payload, mobileNumber: payload.phone_number, serviceID: payload.plan_id, server: payload.server }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, 'SUCCESS', serverName);
    }
    return res;
  },

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server1';
    const res = await cipApiClient<any>(server === 'server1' ? 'services' : 'electricity/providers', { method: 'GET', data: { server } });
    if (res.status && res.data) {
        if (server === 'server1') {
            const operators = (res.data.electricity || []).map((e: any) => ({ id: String(e.serviceID), name: e.disco }));
            return { status: true, data: operators };
        }
        return res;
    }
    return res;
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server1';
    const endpoint = server === 'server1' ? 'validatemeter' : 'electricity/verify';
    const apiData = server === 'server1' ? { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2 } : payload;
    return await cipApiClient<any>(endpoint, { data: { ...apiData, server }, method: 'POST' });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server1';
    const serverName = server === 'server1' ? 'Omega Server' : 'Boom Server';
    const endpoint = server === 'server1' ? 'payelectric' : 'electricity/purchase';
    
    const res = await cipApiClient<any>(endpoint, { 
      data: { ...payload, mobileNumber: payload.phone, meterNum: payload.meter_number, serviceID: payload.provider_id, server }, 
      method: 'POST' 
    });
    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', serverName);
    }
    return res;
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const server = 'server2';
    const config = await getSystemConfig();
    const margin = config.pricing?.server2?.cable_margin ?? 100;
    const res = await cipApiClient<any>(`cable/plans?biller=${billerName}`, { method: 'GET', data: { server } });
    if (res.status && res.data) {
        const rawPlans = (res.data || []) as any[];
        return { 
          status: true, 
          data: rawPlans.map((p: any) => ({
            id: String(p.id || p.code),
            name: p.name,
            amount: Number(String(p.price || p.amount || 0).replace(/,/g, '')) + margin,
            validity: 'Monthly'
          }))
        };
    }
    return res;
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    const server = 'server2';
    return await cipApiClient<any>('cable/verify', { data: { ...payload, server }, method: 'POST' });
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const res = await cipApiClient<any>('cable/purchase', { 
      data: { ...payload, iucNum: payload.smartCardNumber, serviceID: payload.planCode, server: 'server2' }, 
      method: 'POST' 
    });
    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', 'Boom Server');
    }
    return res;
  },

  purchaseEducation: async (payload: { type: string; quantity: number; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.education || 'server1';
    const serverName = server === 'server1' ? 'Omega Server' : 'Boom Server';
    
    const res = await cipApiClient<any>('education', { 
      data: { serviceID: payload.type, quantity: payload.quantity, server }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'EDUCATION', payload.amount, `${payload.type} PIN`, `Quantity: ${payload.quantity}`, 'SUCCESS', serverName);
    }
    return res;
  },

  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    try {
      const txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("date_created", "desc"), limit(50));
      const snapshot = await getDocs(txQuery);
      return { status: true, data: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse)) };
    } catch (error) { return { status: false, message: "Could not load history." }; }
  }
};