import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } catch (e) { console.error("Firebase Init Error", e); }
}
const db = admin.firestore();

export const oplugService = {
  // Find user in Firestore (checks 234... and 0... formats)
  async lookupUser(whatsappPhone) {
    try {
      const localPhone = whatsappPhone.startsWith('234') ? '0' + whatsappPhone.substring(3) : whatsappPhone;
      let snapshot = await db.collection('users').where('phone', '==', whatsappPhone).limit(1).get();
      if (snapshot.empty) snapshot = await db.collection('users').where('phone', '==', localPhone).limit(1).get();
      
      if (snapshot.empty) return { exists: false };
      const userData = snapshot.docs[0].data();
      return { exists: true, uid: snapshot.docs[0].id, name: userData.username || "User", balance: parseFloat(userData.balance) || 0 };
    } catch (error) { return { exists: false }; }
  },

  // Real Paystack Integration
  async generatePaymentDetails(details) {
    try {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `guest_${details.phone}@oplug.com`,
          amount: details.amount * 100,
          channels: ['bank_transfer'],
          metadata: { phone: details.phone, plan_id: details.plan_id }
        })
      });
      const data = await response.json();
      if (data.status) {
        return {
          amount: details.amount,
          bank: data.data.bank_transfer_details?.bank_name || "Paystack",
          account: data.data.bank_transfer_details?.account_number || "Checkout Link",
          url: data.data.authorization_url
        };
      }
      return null;
    } catch (error) { return null; }
  },

  // Data Plans
  async getDataPlans(network) {
    const plans = {
      "MTN": [{ id: "mtn_1gb", label: "1GB - ₦250", price: 250, provider: "Inlomax" }],
      "Airtel": [{ id: "airtel_1gb", label: "1GB - ₦300", price: 300, provider: "Inlomax" }],
      "Glo": [{ id: "glo_1gb", label: "1GB - ₦200", price: 200, provider: "Inlomax" }],
      "9mobile": [{ id: "9mobile_1gb", label: "1GB - ₦400", price: 400, provider: "Inlomax" }]
    };
    return plans[network] || [];
  },

  async processOrder(type, details, user) {
    // Placeholder for your provider logic (Inlomax/CIPTOPUP)
    return { success: true, orderId: "OPL-" + Math.random().toString(36).toUpperCase().substring(2, 10) };
  }
};