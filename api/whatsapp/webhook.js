import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) { console.error('Firebase Init Error:', e); }
}
const db = admin.firestore();

export const oplugService = {
  // 1. DYNAMIC USER LOOKUP
  async lookupUser(whatsappPhone) {
    const localPhone = whatsappPhone.startsWith('234') ? '0' + whatsappPhone.substring(3) : whatsappPhone;
    const snapshot = await db.collection('users').where('phone', 'in', [whatsappPhone, localPhone]).limit(1).get();
    if (snapshot.empty) return { exists: false };
    const data = snapshot.docs[0].data();
    return { 
      exists: true, 
      uid: snapshot.docs[0].id, 
      name: data.username || data.name || "User", 
      balance: parseFloat(data.walletBalance || 0),
      email: data.email
    };
  },

  // 2. FETCH REAL-TIME PLANS & PRICES
  async getDynamicPlans(network) {
    try {
      // Fetch from your Provider (Inlomax as default)
      const apiKey = process.env.INLOMAX_API_KEY;
      const response = await fetch(`https://inlomax.com/api/data/`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      const apiData = await response.json();
      
      // Filter for requested network and merge with your Firestore overrides
      const priceSnapshot = await db.collection('prices').where('network', '==', network.toLowerCase()).get();
      const overrides = {};
      priceSnapshot.forEach(doc => { overrides[doc.id] = doc.data().amount; });

      // Assuming API returns a list of plans
      return (apiData.plans || []).filter(p => p.network.toLowerCase() === network.toLowerCase()).map(p => ({
        id: p.id,
        label: `${p.name} - ₦${(overrides[p.id] || p.price).toLocaleString()}`,
        price: overrides[p.id] || p.price,
        provider: "server1"
      }));
    } catch (e) { return []; }
  },

  // 3. REAL VENDING & TRANSACTION LOGGING
  async processVending(type, details, user) {
    try {
      const isServer2 = details.provider === "server2";
      const baseUrl = isServer2 ? 'https://api.ciptopup.ng/api' : 'https://inlomax.com/api';
      const apiKey = isServer2 ? process.env.CIPTOPUP_API_KEY : process.env.INLOMAX_API_KEY;
      const endpoint = isServer2 ? 'data/buy' : (type === 'airtime' ? 'airtime' : 'data');

      // Mapping from your Server.ts
      const mapped = isServer2 
        ? { plan_id: details.plan_id, phone_number: details.phone, amount: details.amount }
        : { serviceID: String(details.plan_id || details.network).toLowerCase(), mobileNumber: String(details.phone), amount: Number(details.amount) };

      const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (isServer2) headers['x-api-key'] = apiKey;
      else { headers['Authorization'] = `Token ${apiKey}`; headers['Authorization-Token'] = apiKey; }

      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(mapped)
      });

      const result = await response.json();

      if (result.status === "success" || result.code === "success") {
        // A. DEDUCT BALANCE
        await db.collection('users').doc(user.uid).update({
          walletBalance: admin.firestore.FieldValue.increment(-details.price)
        });

        // B. LOG TO TRANSACTION HISTORY (For Website Receipt)
        const txRef = result.transaction_id || result.id || `BOT-${Date.now()}`;
        await db.collection('transactions').add({
          userId: user.uid,
          userEmail: user.email,
          type: type.toUpperCase(),
          amount: details.price,
          source: `${details.network} ${type} (via WhatsApp)`,
          remarks: `Purchase for ${details.phone}`,
          status: 'SUCCESS',
          reference: txRef,
          date_created: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, orderId: txRef };
      }
      return { success: false, message: result.message || "Provider error" };
    } catch (e) { return { success: false, message: "Connection error" }; }
  }
};