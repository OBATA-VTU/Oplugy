import { ApiResponse, Operator, DataPlan, TransactionResponse, VerificationResponse, UserRole } from '../types';
import { cipApiClient } from './cipApiClient';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

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

async function logTransaction(userId: string, type: TransactionResponse['type'], amount: number, source: string, remarks: string, status: 'SUCCESS' | 'PENDING' | 'FAILED' = 'SUCCESS', extraData: any = {}) {
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
      server: 'Inlomax Node',
      ...extraData,
      date_created: serverTimestamp(),
      date_updated: serverTimestamp()
    });
    if (status !== 'FAILED' && type !== 'FUNDING' && type !== 'REFERRAL') {
      await updateDoc(doc(db, "users", user.uid), { walletBalance: increment(-Number(amount)) });
    }
  } catch (e) { console.error("History log fail:", e); }
}

export const vtuService = {
  checkServerStatus: async (server: 1 | 2): Promise<ApiResponse<any>> => {
    try {
      const endpoint = server === 1 ? 'services' : 'data/plans';
      const res = await cipApiClient<any>(endpoint, { method: 'GET', server });
      console.log(`[vtuService] checkServerStatus Server ${server} raw response:`, res);
      
      // For Server 2, the "Invalid option" error actually confirms the server is reachable and responding
      if (res.status || (server === 2 && String(res.message).toLowerCase().includes('expected one of'))) {
        return { status: true, message: `Server ${server} is online and connected.` };
      }
      
      console.error(`[vtuService] checkServerStatus Server ${server} failed:`, res.message);
      return { status: false, message: `Server ${server} connection failed: ${res.message}` };
    } catch (e: any) {
      console.error(`[vtuService] checkServerStatus Server ${server} exception:`, e);
      return { status: false, message: `Server ${server} is offline.` };
    }
  },

  purchaseAirtime: async (payload: { network: string; phone: string; amount: number }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };

    const res = await cipApiClient<any>('airtime', { 
      data: { serviceID: payload.network, mobileNumber: payload.phone, amount: payload.amount }, 
      method: 'POST',
      server: 1
    });
    
    if (res.status) {
      await logTransaction(user.uid, 'AIRTIME', payload.amount, `${payload.network} Airtime`, `Recharge for ${payload.phone}`, 'SUCCESS');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getAirtimeOperators: async (): Promise<ApiResponse<Operator[]>> => {
    try {
      const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
      const airtimeData = res.status && res.data ? (res.data.airtime || res.data.airtime_networks || res.data.airtimePlans) : null;
      
      if (airtimeData && Array.isArray(airtimeData)) {
        const operators = airtimeData.map((a: any) => ({
          id: String(a.serviceID || a.id),
          name: String(a.network || a.name || a.serviceName),
          image: '' 
        }));
        return { status: true, data: operators };
      }
      
      return { status: false, message: 'Could not load airtime networks.' };
    } catch (e) {
      return { status: false, message: 'Loading airtime failed.' };
    }
  },

  getDataNetworks: async (server: 1 | 2 = 1): Promise<ApiResponse<Operator[]>> => {
    try {
      if (server === 1) {
        const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
        if (res.status && res.data?.dataPlans) {
          const plans = res.data.dataPlans as any[];
          const networks = Array.from(new Set(plans.map(p => p.network))).filter(n => !!n);
          return { 
            status: true, 
            data: networks.map(n => ({ id: n, name: n })) 
          };
        }
      } else {
        // Server 2 (Ciptopup)
        const res = await cipApiClient<any>('data/plans', { method: 'GET', server: 2 });
        
        // DYNAMIC EXTRACTION: No hardcoded network names. 
        // We parse the API's own error message to find what it expects.
        if (!res.status && res.message?.includes('expected one of')) {
          const parts = res.message.split('expected one of');
          if (parts.length > 1) {
            const networkPart = parts[1];
            const regex = /"([^"]+)"/g;
            let match;
            const networksFromError: string[] = [];
            while ((match = regex.exec(networkPart)) !== null) {
              networksFromError.push(match[1]);
            }
            if (networksFromError.length > 0) {
              return { status: true, data: networksFromError.map(n => ({ id: n, name: n })) };
            }
          }
        }

        if (!res.status) return res;
        
        const rawPlans = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.plans || []);
        
        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          const networksList = Array.from(new Set(rawPlans.map((p: any) => p.network || p.network_name || p.operator))).filter(n => !!n);
          if (networksList.length > 0) {
            return { 
              status: true, 
              data: networksList.map(n => ({ id: String(n), name: String(n) })) 
            };
          }
        }
      }
    } catch (e) { console.error("Network fetch error:", e); }
    return { status: false, message: `Server ${server} loading failed.` };
  },

  getDataCategories: async (network: string, server: 1 | 2 = 1): Promise<ApiResponse<string[]>> => {
    try {
      if (server === 1) {
        const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
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
        // Server 2 (Ciptopup) - Fetch all plans and extract unique types
        const res = await cipApiClient<any>('data/plans', { 
          method: 'GET', 
          server: 2,
          data: { network } // Pass the network to get plans for this network
        });
        console.log('[vtuService] Server 2 Categories Raw Response:', res);
        if (!res.status) return res;
        
        const rawPlans = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.plans || []);
        console.log('[vtuService] Server 2 Categories Processed Raw Plans:', rawPlans);
        
        if (Array.isArray(rawPlans)) {
          const categories = Array.from(new Set(
            rawPlans
              .filter((p: any) => {
                const pNet = String(p.network || p.network_name || p.operator || '').trim().toUpperCase();
                const searchNet = String(network).trim().toUpperCase();
                const match = pNet === searchNet || pNet.includes(searchNet) || searchNet.includes(pNet);
                // console.log(`[vtuService] Filtering: Plan Network: ${pNet}, Search Network: ${searchNet}, Match: ${match}`);
                return match;
              })
              .map((p: any) => p.type || p.dataType || p.plan_type || p.category)
          )).filter(c => !!c);
          console.log('[vtuService] Server 2 Extracted Categories:', categories);
          return { status: true, data: categories };
        }
      }
    } catch (e) { console.error("Category fetch error:", e); }
    return { status: false, message: `Server ${server} loading failed.` };
  },

  getDataPlans: async (payload: { network: string; type: string; userRole?: UserRole; server?: 1 | 2 }): Promise<ApiResponse<DataPlan[]>> => {
    const role = payload.userRole || 'user';
    const selectedServer = payload.server || 1;
    
    try {
      if (selectedServer === 1) {
        const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
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
            const validityStr = p.validity ? ` (${p.validity})` : '';
            
            plans.push({
              id: planId,
              name: `${p.dataPlan} ${p.dataType}${validityStr}`,
              amount: manual || rawBase, 
              validity: p.validity || '30 Days'
            });
          }
          return { status: true, data: plans };
        }
      } else {
        // Server 2 (Ciptopup)
        const [res, marginDoc] = await Promise.all([
          cipApiClient<any>('data/plans', { 
            method: 'GET', 
            server: 2,
            data: { network: payload.network } // Pass the network to get plans for this network
          }),
          getDoc(doc(db, "settings", "server2_config"))
        ]);
        
        if (!res.status) return res;
        
        const marginRaw = marginDoc.exists() ? marginDoc.data().general_margin : 0;
        const margin = isNaN(Number(marginRaw)) ? 0 : Number(marginRaw);
        
        const rawPlans = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.plans || []);
        
        if (Array.isArray(rawPlans)) {
          // Filter client-side as the API might not support query filters
          const filteredData = rawPlans.filter((p: any) => {
            const pNet = String(p.network || p.network_name || p.operator || '').trim().toUpperCase();
            const searchNet = String(payload.network).trim().toUpperCase();
            const netMatch = !payload.network || pNet === searchNet || pNet.includes(searchNet) || searchNet.includes(pNet);
            
            const pType = String(p.type || p.dataType || p.plan_type || p.category || '').trim().toUpperCase();
            const searchType = String(payload.type).trim().toUpperCase();
            const typeMatch = !payload.type || pType === searchType || pType.includes(searchType) || searchType.includes(pType);
            
            return netMatch && typeMatch;
          });

          const plans: DataPlan[] = filteredData.map((p: any) => {
            const rawPrice = Number(p.price || p.amount || 0);
            // CIP API returns prices in Kobo
            const priceInNaira = rawPrice / 100;
            
            return {
              id: String(p.id || p.plan_id || p.serviceID),
              name: `${p.name || p.plan_name || 'Data Plan'} (${p.validity || 'N/A'})`,
              amount: priceInNaira + margin,
              validity: p.validity || 'N/A'
            };
          });
          return { status: true, data: plans };
        }
      }
    } catch (e: any) {
      return { status: false, message: `Server ${selectedServer} error.` };
    }
    return { status: false, message: 'No plans found.' };
  },

  purchaseData: async (payload: { plan_id: string; phone_number: string; amount: number; network: string; plan_name: string; server?: 1 | 2 }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Please login to continue.' };
    
    const selectedServer = payload.server || 1;
    const endpoint = selectedServer === 1 ? 'data' : 'data/buy';

    const res = await cipApiClient<any>(endpoint, { 
      data: { serviceID: payload.plan_id, mobileNumber: payload.phone_number }, 
      method: 'POST',
      server: selectedServer
    });

    if (res.status) {
      const apiStatus = res.data?.status === 'success' ? 'SUCCESS' : 'PENDING';
      await logTransaction(user.uid, 'DATA', payload.amount, `${payload.network} Data`, `Bundle ${payload.plan_name} for ${payload.phone_number}`, apiStatus);
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getElectricityOperators: async (): Promise<ApiResponse<Operator[]>> => {
    const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
    if (res.status && res.data?.electricity) {
        const operators = (res.data.electricity || []).map((e: any) => ({ 
          id: String(e.serviceID), 
          name: e.disco 
        }));
        return { status: true, data: operators };
    }
    return { status: false, message: 'Electricity service offline.' };
  },

  verifyElectricityMeter: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid' }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('validatemeter', { 
      data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2 }, 
      method: 'POST',
      server: 1
    });
  },

  purchaseElectricity: async (payload: { meter_number: string; provider_id: string; meter_type: 'prepaid' | 'postpaid'; phone: string; amount: number; provider_name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };

    const res = await cipApiClient<any>('payelectric', { 
      data: { serviceID: payload.provider_id, meterNum: payload.meter_number, meterType: payload.meter_type === 'prepaid' ? 1 : 2, amount: payload.amount }, 
      method: 'POST',
      server: 1
    });

    if (res.status) {
      await logTransaction(user.uid, 'ELECTRICITY', payload.amount, `${payload.provider_name} Power`, `Meter ${payload.meter_number}`, 'SUCCESS', { token: res.data?.token });
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getCableProviders: async (): Promise<ApiResponse<Operator[]>> => {
    const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
    if (res.status && res.data?.cablePlans) {
      const billers = Array.from(new Set((res.data.cablePlans as any[]).map(c => c.cable))).map(name => ({
        id: String(name).toLowerCase(),
        name: String(name)
      }));
      return { status: true, data: billers };
    }
    return { status: false, message: 'Cable service loading failed.' };
  },

  getCablePlans: async (billerName: string): Promise<ApiResponse<DataPlan[]>> => {
    const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
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
    return { status: false, message: 'Cable service offline.' };
  },

  verifyCableSmartcard: async (payload: { biller: string; smartCardNumber: string }): Promise<ApiResponse<VerificationResponse>> => {
    return await cipApiClient<any>('validatecable', { 
      data: { serviceID: payload.biller, iucNum: payload.smartCardNumber }, 
      method: 'POST',
      server: 1
    });
  },

  purchaseCable: async (payload: { planCode: string; smartCardNumber: string; amount: number; plan_name: string; biller: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };

    const res = await cipApiClient<any>('subcable', { 
      data: { serviceID: payload.planCode, iucNum: payload.smartCardNumber }, 
      method: 'POST',
      server: 1
    });

    if (res.status) {
      await logTransaction(user.uid, 'CABLE', payload.amount, `${payload.biller} TV`, `${payload.plan_name} for ${payload.smartCardNumber}`, 'SUCCESS');
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  purchaseEducation: async (payload: { type: string; quantity: number; amount: number, name: string }): Promise<ApiResponse<TransactionResponse>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    
    const res = await cipApiClient<any>('education', { 
      data: { serviceID: payload.type, quantity: payload.quantity }, 
      method: 'POST',
      server: 1
    });

    if (res.status) {
      await logTransaction(user.uid, 'EDUCATION', payload.amount, `${payload.name}`, `Quantity: ${payload.quantity}`, 'SUCCESS', { pins: res.data?.pins });
      return { status: true, message: res.message, data: res.data };
    }
    return res;
  },

  getEducationPlans: async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
      if (res.status && res.data?.education) {
        return { 
          status: true, 
          data: (res.data.education || []).map((e: any) => ({
            id: String(e.serviceID),
            name: String(e.type),
            price: Number(String(e.amount || 0).replace(/,/g, ''))
          }))
        };
      }
    } catch (e) {}
    return { status: false, message: 'Education service offline.' };
  },

  getTransactionHistory: async (): Promise<ApiResponse<TransactionResponse[]>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    try {
      // Simplified query to avoid index requirement if not created yet
      const txQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), limit(50));
      const snapshot = await getDocs(txQuery);
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TransactionResponse));
      // Sort manually in memory to ensure descending order without composite index
      data.sort((a: any, b: any) => {
        const dateA = a.date_created?.seconds || 0;
        const dateB = b.date_created?.seconds || 0;
        return dateB - dateA;
      });
      return { status: true, data };
    } catch (error) { return { status: false, message: "History not available." }; }
  },

  recordTransaction: async (tx: any): Promise<void> => {
    try {
      await addDoc(collection(db, "transactions"), {
        ...tx,
        server: 'Inlomax Node',
        date_created: serverTimestamp(),
        date_updated: serverTimestamp()
      });
    } catch (e) {
      console.error("Manual record fail:", e);
    }
  },

  submitManualFundingRequest: async (payload: { amount: number; receiptUrl: string }): Promise<ApiResponse<any>> => {
    const user = auth.currentUser;
    if (!user) return { status: false, message: 'Auth required.' };
    try {
      await addDoc(collection(db, "funding_requests"), {
        userId: user.uid,
        userEmail: user.email,
        amount: payload.amount,
        receiptUrl: payload.receiptUrl,
        status: 'PENDING',
        date_created: serverTimestamp(),
      });
      return { status: true, message: 'Funding request submitted successfully. Admin will review it shortly.' };
    } catch (e) {
      return { status: false, message: 'Failed to submit request.' };
    }
  }
};