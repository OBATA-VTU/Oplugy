import admin from 'firebase-admin';

// Initialize Firebase Admin (Ensure you have your service account config)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();

export const oplugService = {
  // 1. Check Firestore for the user
  async lookupUser(phoneNumber) {
    try {
      // Assuming your users collection uses phone numbers as IDs or has a 'phone' field
      const userRef = db.collection('users').where('phone', '==', phoneNumber).limit(1);
      const snapshot = await userRef.get();

      if (snapshot.empty) return { exists: false };

      const userData = snapshot.docs[0].data();
      return { 
        exists: true, 
        name: userData.username || "User", 
        balance: userData.balance || 0,
        uid: snapshot.docs[0].id
      };
    } catch (error) {
      console.error("Firestore Lookup Error:", error);
      return { exists: false };
    }
  },

  // 2. Data Plans with Provider Routing
  async getDataPlans(network) {
    // You can fetch these from Firestore too, but here is the hardcoded version
    return {
      "MTN": [
        { id: "mtn_s1_1gb", label: "1GB (Server 1) - ₦250", provider: "Inlomax" },
        { id: "mtn_s2_1gb", label: "1GB (Server 2) - ₦240", provider: "CIPTOPUP" }
      ],
      "Airtel": [{ id: "airtel_1gb", label: "1GB - ₦300", provider: "Inlomax" }],
      "Glo": [{ id: "glo_1gb", label: "1GB - ₦200", provider: "Inlomax" }],
      "9mobile": [{ id: "9mobile_1gb", label: "1GB - ₦400", provider: "Inlomax" }]
    };
  },

  // 3. Process Order (Deducts from Firestore + Calls Provider)
  async processOrder(type, details, user) {
    try {
      // A. Get Price (Check Firestore overrides first)
      let price = details.amount || 0; 
      const priceDoc = await db.collection('prices').doc(details.plan_id || 'airtime').get();
      if (priceDoc.exists) price = priceDoc.data().value;

      // B. Check Balance
      if (user.balance < price) return { success: false, message: "Insufficient Balance" };

      // C. Call the correct Provider
      let providerResult;
      if (details.provider === "CIPTOPUP") {
        providerResult = await this.callCIPTOPUP(details);
      } else {
        providerResult = await this.callInlomax(details);
      }

      if (providerResult.success) {
        // D. Deduct from Firestore
        await db.collection('users').doc(user.uid).update({
          balance: admin.firestore.FieldValue.increment(-price)
        });
        return { success: true, orderId: providerResult.id };
      }
      
      return { success: false, message: providerResult.error };
    } catch (error) {
      return { success: false, error: "System Error" };
    }
  },

  // Provider API Wrappers
  async callInlomax(details) { /* Add your Inlomax API logic here */ return { success: true, id: "INL_123" }; },
  async callCIPTOPUP(details) { /* Add your CIPTOPUP API logic here */ return { success: true, id: "CIP_123" }; }
};