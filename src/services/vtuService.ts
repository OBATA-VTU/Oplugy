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
  } catch (e) { console.error("Database error while saving history:", e); }
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

  getDataPlans: async (payload: { network: string; type: string; server?: 'server1' | 'server2' }): Promise<ApiResponse<DataPlan[]>> => {
    const userDoc = auth.currentUser ? await getDoc(doc(db, "users", auth.currentUser.uid)) : null;
    const role = (userDoc?.data()?.role as UserRole) || 'user';
    const config = await getSystemConfig();
    const server = payload.server || config.routing?.data || 'server1';
    
    // CRITICAL FIX: Ensure margin is treated as a Number to prevent text joining (e.g. 2000 + 10 = 2010, not 200010)
    const margin = Number(config.pricing?.[`${role}_margin`] || 10);
    const extraServer1Margin = (server === 'server1') ? 10 : 0; 

    const res = await cipApiClient<any>(server === 'server1' ? 'services' : `data/plans?network=${payload.network}&type=${payload.type}`, { method: 'GET', data: { server } });
    
    if (res.status && res.data) {
      let plans: any[] = [];
      if (server === 'server1') {
        plans = (res.data.dataPlans || [])
          .filter((p: any) => p.network.toUpperCase() === payload.network.toUpperCase())
          .map((p: any) => ({
            id: p.serviceID,
            name: `${p.dataPlan} ${p.dataType}`,
            // FIX: Use Number() to ensure math is done correctly
            amount: Number(p.amount) + margin + extraServer1Margin,
            validity: p.validity
          }));
      } else {
        // FIX: Also ensure server 2 prices are numbers
        plans = res.data.map((p: any) => ({
          id: p.id || p.code,
          name: p.name,
          amount: Number(p.price) + margin,
          validity: p.validity || '30 Days'
        }));
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

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    const config = await getSystemConfig();
    const server = config.routing?.bills || 'server2';
    const res = await cipApiClient<any>(server === 'server1' ? 'services' : 'electricity/providers', { method: 'GET', data: { server } });
    if (res.status && res.data) {
        if (server === 'server1') {
            const operators = (res.data.electricity || []).map((e: any) => ({ id: e.serviceID, name: e.disco }));
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
    const config = await getSystemConfig();
    const server = config.routing?.cable || 'server2';
    const res = await cipApiClient<any>(server === 'server1' ? 'services' : `cable/plans?biller=${billerName}`, { method: 'GET', data: { server } });
    if (res.status && res.data) {
        if (server === 'server1') {
            const plans = (res.data.cablePlans || [])
                .filter((p: any) => p.cable.toUpperCase() === billerName.toUpperCase())
                .map((p: any) => ({
                    id: p.serviceID,
                    name: p.cablePlan,
                    amount: Number(p.amount.replace(',', '')),
                    validity: 'Monthly'
                }));
            return { status: true, data: plans };
        }
        return res;
    }
    return res;
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    const config = await getSystemConfig();
    const server = config.routing?.cable || 'server2';
    const endpoint = server === 'server1' ? 'validatecable' : 'cable/verify';
    const apiData = server === 'server1' ? { serviceID: payload.biller, iucNum: payload.smartCardNumber } : payload;
    return await cipApiClient<any>(endpoint, { data: { ...apiData, server }, method: 'POST' });
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const config = await getSystemConfig();
    const server = config.routing?.cable || 'server2';
    const endpoint = server === 'server1' ? 'subcable' : 'cable/purchase';
    
    const res = await cipApiClient<any>(endpoint, { 
      data: { ...payload, iucNum: payload.smartCardNumber, serviceID: payload.planCode, server }, 
      method: 'POST' 
    });
    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', server.toUpperCase());
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