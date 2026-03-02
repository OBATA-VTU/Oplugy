import admin from 'firebase-admin';

// 1. Initialize Firebase Admin (Using your Server.ts logic)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp();
    }
  } catch (e) { console.error('Firebase Init Error:', e); }
}

const db = admin.firestore();

export const oplugService = {
  // 2. User Lookup (Using 'walletBalance' field from your Server.ts)
  async lookupUser(whatsappPhone) {
    try {
      const localPhone = whatsappPhone.startsWith('234') ? '0' + whatsappPhone.substring(3) : whatsappPhone;
      const snapshot = await db.collection('users').where('phone', 'in', [whatsappPhone, localPhone]).limit(1).get();
      
      if (snapshot.empty) return { exists: false };
      
      const data = snapshot.docs[0].data();
      return { 
        exists: true, 
        uid: snapshot.docs[0].id, 
        name: data.username || "User", 
        balance: parseFloat(data.walletBalance) || 0 
      };
    } catch (error) { return { exists: false }; }
  },

  // 3. Server 1 (Inlomax) Fulfillment Logic (Directly from your Server.ts)
  async callServer1(endpoint, data) {
    const apiKey = process.env.INLOMAX_API_KEY;
    const baseUrl = 'https://inlomax.com/api';
    const cleanEndpoint = endpoint.replace(/^\//, '');
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`
    };
    if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(cleanEndpoint)) {
      headers['Authorization-Token'] = apiKey;
    }

    // Your strict mapping logic
    const mapped = {};
    const rawServiceID = String(data.plan_id || data.network || '');
    if (['validatecable', 'subcable', 'airtime'].includes(cleanEndpoint) && isNaN(Number(rawServiceID))) {
      mapped.serviceID = rawServiceID.toLowerCase();
    } else {
      mapped.serviceID = rawServiceID;
    }
    mapped.mobileNumber = String(data.phone);
    if (data.amount) mapped.amount = Number(data.amount);

    const res = await fetch(`${baseUrl}/${cleanEndpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mapped)
    });
    return await res.json();
  },

  // 4. Server 2 (CIPTOPUP) Fulfillment Logic (Directly from your Server.ts)
  async callServer2(endpoint, data) {
    const apiKey = process.env.CIPTOPUP_API_KEY;
    const baseUrl = 'https://api.ciptopup.ng/api';
    const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };

    const payload = { ...data };
    if (endpoint === 'data/buy') {
      payload.plan_id = data.plan_id;
      payload.phone_number = data.phone;
    }

    const res = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // 5. Paystack Initialization (Using your Proxy Logic)
  async generatePaymentDetails(details) {
    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `guest_${details.phone}@oplug.com`,
          amount: details.amount * 100,
          channels: ['bank_transfer'],
          metadata: { phone: details.phone, plan_id: details.plan_id }
        })
      });
      const data = await res.json();
      if (data.status) {
        return {
          amount: details.amount,
          bank: data.data.bank_transfer_details?.bank_name || "Paystack Transfer",
          account: data.data.bank_transfer_details?.account_number || "Checkout Link",
          url: data.data.authorization_url
        };
      }
      return null;
    } catch (e) { return null; }
  }
};