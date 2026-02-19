import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

async function getSystemConfig() {
  try {
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    return settingsDoc.exists() ? settingsDoc.data() : { pricing: { user_margin: 10 } };
  } catch (e) {
    return { pricing: { user_margin: 10 } };
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
  // Airtime Integration
  purchaseAirtime: async (payload: { network: string; phone: string; amount: number; server?: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };

    const server = payload.server || 'server1';
    const serverName = server === 'server1' ? 'Inlomax Node' : 'CIP Node';
    
    const res = await cipApiClient<any>('airtime', { 
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
        // CIP Step 1 identifies plans directly via query, but we can infer categories if needed.
        // For consistency, we'll return fixed categories or fetch if CIP adds an endpoint.
        // Mocking for now based on common Nigerian data types if CIP doesn't have a distinct category endpoint
        return { status: true, data: ['SME', 'GIFTING', 'AWOOF', 'DATASHARE'] };
      }
    } catch (e) { console.error("Category fetch error:", e); }
    return { status: false, message: 'Node synchronization failed.' };
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
        // CIP Step 1: GET /api/data/plans?network={Network}&type={DataType}
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
      return { status: false, message: 'Database node is currently unreachable.' };
    }
    return { status: false, message: 'No valid plans returned by upstream node.' };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string; server: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    const serverName = payload.server === 'server1' ? 'Inlomax Node' : 'CIP Node';
    
    // Server 1 uses 'data', Server 2 uses 'data/plans' per docs
    const endpoint = payload.server === 'server1' ? 'data' : 'data/plans';
    const res = await cipApiClient<any>(endpoint, { 
      data: { 
        plan_id: payload.plan_id, 
        phone_number: payload.phone_number, 
        serviceID: payload.plan_id, // Backward compat for server1
        mobileNumber: payload.phone_number, // Backward compat for server1
        server: payload.server 
      }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, 'SUCCESS', serverName);
    }
    return res;
  },

  // Electricity Integration
  getElectricityOperators: async (server: 'server1' | 'server2' = 'server1'): Promise<ApiResponse<Operator[]>> => {
    if (server === 'server1') {
      const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
      if (res.status && res.data?.electricity) {
          const operators = (res.data.electricity || []).map((e: any) => ({ 
            id: String(e.serviceID), 
            name: e.disco 
          }));
          return { status: true, data: operators };
      }
    } else {
      // CIP: GET /api/electricity
      const res = await cipApiClient<any[]>('electricity', { method: 'GET', data: { server: 'server2' } });
      if (res.status && Array.isArray(res.data)) {
        return { status: true, data: res.data.map((e: any) => ({ id: e.id, name: e.name })) };
      }
    }
    return { status: false, message: 'Electricity providers node offline.' };
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; server?: 'server1' | 'server2' }): Promise<ApiResponse<VerificationResponse>> => {
    const server = payload.server || 'server1';
    if (server === 'server1') {
      return await cipApiClient<any>('validatemeter', { 
        data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2, server: 'server1' }, 
        method: 'POST' 
      });
    } else {
      // CIP: POST /api/electricity/validate
      return await cipApiClient<any>('electricity/validate', {
        data: { 
          meter_number: payload.meter_number, 
          provider_id: payload.provider_id, 
          meter_type: payload.meter_type,
          server: 'server2' 
        },
        method: 'POST'
      });
    }
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string; server?: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    const server = payload.server || 'server1';
    const serverName = server === 'server1' ? 'Inlomax Node' : 'CIP Node';
    
    let res;
    if (server === 'server1') {
      res = await cipApiClient<any>('payelectric', { 
        data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2, amount: payload.amount, server: 'server1' }, 
        method: 'POST' 
      });
    } else {
      // CIP: POST /api/electricity
      res = await cipApiClient<any>('electricity', {
        data: {
          meter_number: payload.meter_number,
          provider_id: payload.provider_id,
          meter_type: payload.meter_type,
          amount: payload.amount,
          phone: payload.phone,
          server: 'server2'
        },
        method: 'POST'
      });
    }

    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', serverName);
    }
    return res;
  },

  // Cable Integration
  getCablePlans: async (billerName: string, server: 'server1' | 'server2' = 'server1'): Promise<ApiResponse<DataPlan[]>> => {
    if (server === 'server1') {
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
    } else {
      // CIP: GET /api/tv?biller={biller_name}
      const res = await cipApiClient<any[]>(`tv?biller=${billerName}`, { method: 'GET', data: { server: 'server2' } });
      if (res.status && Array.isArray(res.data)) {
        return { 
          status: true, 
          data: res.data.map((p: any) => ({
            id: String(p.code),
            name: p.name,
            amount: Number(String(p.price).replace(/,/g, '')),
            validity: 'Monthly'
          }))
        };
      }
    }
    return { status: false, message: 'Cable packages synchronization failed.' };
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string; server?: 'server1' | 'server2' }): Promise<ApiResponse<VerificationResponse>> => {
    const server = payload.server || 'server1';
    if (server === 'server1') {
      return await cipApiClient<any>('validatecable', { 
        data: { serviceID: payload.biller, iucNum: payload.smartCardNumber, server: 'server1' }, 
        method: 'POST' 
      });
    } else {
      // CIP: POST /api/tv/verify
      return await cipApiClient<any>('tv/verify', {
        data: { biller: payload.biller, smartCardNumber: payload.smartCardNumber, server: 'server2' },
        method: 'POST'
      });
    }
  },

  purchaseCable: async (payload: { biller: string; planCode: string; smartCardNumber: string; subscriptionType: 'RENEW' | 'CHANGE'; phoneNumber: string; amount: number; plan_name: string; server?: 'server1' | 'server2' }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    const server = payload.server || 'server1';
    const serverName = server === 'server1' ? 'Inlomax Node' : 'CIP Node';
    
    let res;
    if (server === 'server1') {
      res = await cipApiClient<any>('subcable', { 
        data: { serviceID: payload.planCode, iucNum: payload.smartCardNumber, server: 'server1' }, 
        method: 'POST' 
      });
    } else {
      // CIP: POST /api/tv
      res = await cipApiClient<any>('tv', {
        data: {
          biller: payload.biller,
          planCode: payload.planCode,
          smartCardNumber: payload.smartCardNumber,
          subscriptionType: payload.subscriptionType,
          phoneNumber: payload.phoneNumber,
          server: 'server2'
        },
        method: 'POST'
      });
    }

    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS', serverName);
    }
    return res;
  },

  // Education: Strictly Server 1 (Inlomax) as no CIP doc provided for this
  purchaseEducation: async (payload: { type: string; quantity: number; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    
    const res = await cipApiClient<any>('education', { 
      data: { serviceID: payload.type, quantity: payload.quantity, server: 'server1' }, 
      method: 'POST' 
    });

    if (res.status) {
      await logTransaction(user.uid, 'EDUCATION', payload.amount, `Exam PIN`, `Quantity: ${payload.quantity}`, 'SUCCESS', 'Inlomax Node');
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
    } catch (error) { return { status: false, message: "Ledger offline." }; }
  }
};