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
      exists: true, uid: snapshot.docs[0].id, 
      name: data.username || data.name || "User", 
      balance: parseFloat(data.walletBalance || 0),
      email: data.email
    };
  },

  // 2. DYNAMIC FETCHING (Mirroring your Server.ts logic)
  async fetchFromProvider(server, endpoint, method, data) {
    const isServer2 = server === "server2";
    const baseUrl = isServer2 ? 'https://api.ciptopup.ng/api' : 'https://inlomax.com/api';
    const apiKey = isServer2 ? process.env.CIPTOPUP_API_KEY : process.env.INLOMAX_API_KEY;
    
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (isServer2) headers['x-api-key'] = apiKey;
    else { headers['Authorization'] = `Token ${apiKey}`; headers['Authorization-Token'] = apiKey; }

    // Strict Mapping Logic from your Server.ts
    let body = data;
    if (!isServer2 && method === 'POST') {
      const mapped = {};
      mapped.serviceID = String(data.serviceID || data.plan_id || data.network || '').toLowerCase();
      mapped.mobileNumber = String(data.phone || data.mobileNumber || '');
      if (data.amount) mapped.amount = Number(data.amount);
      if (data.iucNum) mapped.iucNum = String(data.iucNum);
      if (data.meterNum) mapped.meterNum = String(data.meterNum);
      if (data.meterType) mapped.meterType = (data.meterType === 'prepaid' || data.meterType === 1) ? 1 : 2;
      body = mapped;
    }

    const response = await fetch(`${baseUrl}/${endpoint.replace(/^\//, '')}`, {
      method: method,
      headers: headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });
    return await response.json();
  },

  // 3. SMM BOOSTER (Ogaviral Logic)
  async callOgaviral(action, data = {}) {
    const params = new URLSearchParams();
    params.append('key', process.env.OGAVIRAL_API_KEY);
    params.append('action', action);
    Object.entries(data).forEach(([k, v]) => params.append(k, String(v)));

    const response = await fetch('https://ogaviral.com/api/v2', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return await response.json();
  },

  // 4. TRANSACTION LOGGING (For Website Receipt)
  async logTransaction(user, details, result) {
    const txRef = result.transaction_id || result.id || `BOT-${Date.now()}`;
    await db.collection('users').doc(user.uid).update({
      walletBalance: admin.firestore.FieldValue.increment(-details.price)
    });
    await db.collection('transactions').add({
      userId: user.uid,
      userEmail: user.email,
      type: details.type.toUpperCase(),
      amount: details.price,
      source: `${details.serviceName} (via WhatsApp)`,
      remarks: `Purchase for ${details.recipient}`,
      status: 'SUCCESS',
      reference: txRef,
      date_created: admin.firestore.FieldValue.serverTimestamp()
    });
    return txRef;
  }
};