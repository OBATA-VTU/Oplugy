import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole, ServiceRouting } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const DEFAULT_ROUTING: ServiceRouting = {
  airtime: 'server1',
  data: 'server1',
  bills: 'server2',
  cable: 'server2',
  education: 'server1'
};

async function getSystemConfig() {
  const settingsDoc = await getDoc(doc(db, "settings", "global"));
  return settingsDoc.exists() ? settingsDoc.data() : { pricing: { user_margin: 10 }, routing: DEFAULT_ROUTING };
}

async function getManualPrice(planId: string, role: UserRole): Promise<number | null> {
  const priceDoc = await getDoc(doc(db, "manual_pricing", planId));
  if (priceDoc.exists()) {
    const prices = priceDoc.data();
    // Use role-specific price, fallback to user_price
    const priceKey = `${role}_price`;
    return Number(prices[priceKey] || prices.user_price);
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

    let serviceID = payload.network;
    if (server === 'server1') {
      if (payload.network.toUpperCase() === 'MTN') serviceID = '1';
      if (payload.network.toUpperCase() === 'AIRTEL') serviceID = '2';
    }

    const res = await cipApiClient<any>(server === 'server1' ? 'airtime' : 'airtime/purchase', { 
      data: { ...payload, mobileNumber: payload.phone, serviceID, server }, 
      method: 'POST' 
    });
    
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`, 'SUCCESS', server.toUpperCase());
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getDataCategories: async (network: string, server: 'server1' | 'server2'): Promise<ApiResponse<string[]>> => {
    if (server === 'server1') {
      const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
      if (res.status && res.data?.dataPlans) {
        const plans = res.data.dataPlans as any[];
        const categories = Array.from(new Set(
          plans
            .filter(p => p.network.toUpperCase() === network.toUpperCase())
            .map(p => p.dataType)
        ));
        return { status: true, data: categories };
      }
    }
    return { status: false, message: 'Categories not available.' };
  },

  getDataPlans: async (payload: { network: string; type: string; server?: 'server1' | 'server2' }): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const server = payload.server || 'server1';
    
    const res = await cipApiClient<any>(server === 'server1' ? 'services' : `data/plans?network=${payload.network}&type=${payload.type}`, { 
      method: 'GET', 
      data: { server } 
    });
    
    if (res.status && res.data) {
      let plans: DataPlan[] = [];
      if (server === 'server1') {
        const rawPlans = (res.data.dataPlans || []) as any[];
        const filtered = rawPlans.filter((p: any) => 
          p.network.toUpperCase() === payload.network.toUpperCase() && 
          p.dataType.toUpperCase() === payload.type.toUpperCase()
        );

        for (const p of filtered) {
          const planId = String(p.serviceID);
          const manual = await getManualPrice(planId, role);
          const rawBase = Number(String(p.amount).replace(/,/g, ''));
          plans.push({
            id: planId,
            name: `${p.dataPlan} ${p.dataType}`,
            amount: manual || (rawBase + 10), 
            validity: p.validity
          });
        }
      } else {
        // SERVER 2 LOGIC: Base API + 10 Fixed Profit for display and charge
        const rawPlans = (res.data || []) as any[];
        plans = rawPlans.map((p: any) => {
          const rawBase = Number(String(p.price || p.amount || 0).replace(/,/g, ''));
          return {
            id: String(p.id || p.code),
            name: p.name,
            amount: rawBase + 10,
            validity: p.validity || '30 Days'
          };
        });
      }
      return { status: true, data: plans };
    }
    return res;
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string; server: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    
    const endpoint = payload.server === 'server1' ? 'data' : 'data/purchase';
    const res = await cipApiClient<any>(endpoint, { 
      data: { ...payload, mobileNumber: payload.phone_number, serviceID: payload.plan_id, server: payload.server }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, 'SUCCESS', payload.server.toUpperCase());
    }
    return res;
  },

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server2';
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
    const server = config.routing?.bills || 'server2';
    const endpoint = server === 'server1' ? 'validatemeter' : 'electricity/verify';
    const apiData = server === 'server1' ? { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2 } : payload;
    return await cipApiClient<any>(endpoint, { data: { ...apiData, server }, method: 'POST' });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server2';
    const endpoint = server === 'server1' ? 'payelectric' : 'electricity/purchase';
    
    const res = await cipApiClient<any>(endpoint, { 
      data: { ...payload, mobileNumber: payload.phone, meterNum: payload.meter_number, serviceID: payload.provider_id, server }, 
      method: 'POST' 
    });
    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', server.toUpperCase());
    }
    return res;
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    // Force Cable to Server 2 (CIP Topup) as requested
    const server = 'server2';
    const res = await cipApiClient<any>(`cable/plans?biller=${billerName}`, { method: 'GET', data: { server } });
    if (res.status && res.data) {
        const rawPlans = (res.data || []) as any[];
        // Always apply fixed 10 Naira profit for Server 2
        return { 
          status: true, 
          data: rawPlans.map((p: any) => ({
            id: String(p.id || p.code),
            name: p.name,
            amount: Number(String(p.price || p.amount || 0).replace(/,/g, '')) + 10,
            validity: 'Monthly'
          }))
        };
    }
    return res;
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    // Force Cable to Server 2 (CIP Topup)
    const server = 'server2';
    return await cipApiClient<any>('cable/verify', { data: { ...payload, server }, method: 'POST' });
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    // Force Cable to Server 2 (CIP Topup)
    const server = 'server2';
    const res = await cipApiClient<any>('cable/purchase', { 
      data: { ...payload, iucNum: payload.smartCardNumber, serviceID: payload.planCode, server }, 
      method: 'POST' 
    });
    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', 'SERVER 2');
    }
    return res;
  },

  purchaseEducation: async (payload: { type: string; quantity: number; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.education || 'server1';
    
    const res = await cipApiClient<any>('education', { 
      data: { serviceID: payload.type, quantity: payload.quantity, server }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'EDUCATION', payload.amount, `${payload.type} PIN`, `Quantity: ${payload.quantity}`, 'SUCCESS', server.toUpperCase());
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