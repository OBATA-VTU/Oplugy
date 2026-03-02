import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } catch (e) { console.error("Firebase Init Error", e); }
}
const db = admin.firestore();

export const oplugService = {
  // 1. Firestore User Lookup (Handles both 234 and 0 formats)
  async lookupUser(whatsappPhone) {
    const localPhone = whatsappPhone.startsWith('234') ? '0' + whatsappPhone.substring(3) : whatsappPhone;
    const snapshot = await db.collection('users').where('phone', 'in', [whatsappPhone, localPhone]).limit(1).get();
    if (snapshot.empty) return { exists: false };
    const data = snapshot.docs[0].data();
    return { exists: true, uid: snapshot.docs[0].id, name: data.username, balance: parseFloat(data.balance) || 0 };
  },

  // 2. Dynamic Paystack Initialization (Using your Proxy Logic)
  async generatePaymentDetails(details) {
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `guest_${details.phone}@oplug.com`,
          amount: details.amount * 100,
          channels: ['bank_transfer'],
          metadata: { phone: details.phone, plan_id: details.plan_id }
        })
      });
      const res = await response.json();
      if (res.status) {
        return {
          amount: details.amount,
          bank: res.data.bank_transfer_details?.bank_name || "Paystack Transfer",
          account: res.data.bank_transfer_details?.account_number || "Click Link",
          url: res.data.authorization_url
        };
      }
      return null;
    } catch (e) { return null; }
  },

  // 3. Dynamic Fulfillment (Using your Server 1 & Server 2 Proxy Logic)
  async processOrder(type, details, user) {
    try {
      const isServer2 = details.provider === "server2";
      const baseUrl = isServer2 ? 'https://api.ciptopup.ng/api' : 'https://inlomax.com/api';
      const apiKey = isServer2 ? process.env.CIPTOPUP_API_KEY : process.env.INLOMAX_API_KEY;
      const endpoint = isServer2 ? 'data/buy' : (type === 'airtime' ? 'airtime' : 'data');

      // Mapping logic from your Proxy
      const mapped = {};
      if (isServer2) {
        mapped.plan_id = details.plan_id;
        mapped.phone_number = details.phone;
        mapped.amount = details.amount;
      } else {
        // Inlomax strict mapping
        mapped.serviceID = String(details.plan_id || details.network || '').toLowerCase();
        mapped.mobileNumber = String(details.phone);
        if (details.amount) mapped.amount = Number(details.amount);
      }

      const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (isServer2) headers['x-api-key'] = apiKey;
      else {
        headers['Authorization'] = `Token ${apiKey}`;
        headers['Authorization-Token'] = apiKey;
      }

      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(mapped)
      });

      const result = await response.json();

      // Deduct balance if successful
      if (result.status === "success" || result.code === "success") {
        await db.collection('users').doc(user.uid).update({
          balance: admin.firestore.FieldValue.increment(-details.price)
        });
        return { success: true, orderId: result.transaction_id || result.id };
      }
      return { success: false, message: result.message || "Provider error" };
    } catch (e) { return { success: false, message: "Connection failed" }; }
  }
};