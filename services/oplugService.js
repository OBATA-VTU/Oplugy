import admin from 'firebase-admin';

// 1. Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } catch (error) {
    console.error("Firebase Init Error: Check your FIREBASE_SERVICE_ACCOUNT env var.");
  }
}

const db = admin.firestore();

export const oplugService = {
  // Check user in Firestore by phone number
  async lookupUser(phoneNumber) {
    try {
      // We search for the user where the 'phone' field matches the WhatsApp number
      const snapshot = await db.collection('users').where('phone', '==', phoneNumber).limit(1).get();
      if (snapshot.empty) return { exists: false };

      const userData = snapshot.docs[0].data();
      return { 
        exists: true, 
        uid: snapshot.docs[0].id,
        name: userData.username || "User", 
        balance: parseFloat(userData.balance) || 0 
      };
    } catch (error) {
      console.error("Firestore Lookup Error:", error);
      return { exists: false };
    }
  },

  // Data Plans with Server 1 (Inlomax) and Server 2 (CIPTOPUP)
  async getDataPlans(network) {
    const plans = {
      "MTN": [
        { id: "mtn_500mb_s1", label: "500MB (Server 1) - ₦150", provider: "Inlomax", price: 150 },
        { id: "mtn_1gb_s1", label: "1GB (Server 1) - ₦250", provider: "Inlomax", price: 250 },
        { id: "mtn_1gb_s2", label: "1GB (Server 2) - ₦245", provider: "CIPTOPUP", price: 245 }
      ],
      "Airtel": [
        { id: "airtel_1gb", label: "1GB - ₦300", provider: "Inlomax", price: 300 }
      ],
      "Glo": [
        { id: "glo_1gb", label: "1GB - ₦200", provider: "Inlomax", price: 200 }
      ],
      "9mobile": [
        { id: "9mobile_1gb", label: "1GB - ₦400", provider: "Inlomax", price: 400 }
      ]
    };
    return plans[network] || [];
  },

  // Process the actual order
  async processOrder(type, details, user) {
    try {
      // A. Determine Price (Check your Firestore 'prices' collection for overrides)
      let finalPrice = details.price || details.amount;
      const priceDoc = await db.collection('prices').doc(details.plan_id || 'airtime').get();
      if (priceDoc.exists) finalPrice = priceDoc.data().value;

      // B. Check Balance
      if (user.balance < finalPrice) {
        return { success: false, message: "Insufficient wallet balance. Please fund your account." };
      }

      // C. Route to Provider
      let providerResponse;
      if (details.provider === "CIPTOPUP") {
        providerResponse = await this.callCIPTOPUP(type, details);
      } else {
        // Default to Inlomax for Airtime and Server 1 Data
        providerResponse = await this.callInlomax(type, details);
      }

      if (providerResponse.success) {
        // D. Deduct from Firestore Balance
        await db.collection('users').doc(user.uid).update({
          balance: admin.firestore.FieldValue.increment(-finalPrice)
        });
        
        // E. Log Transaction
        await db.collection('transactions').add({
          uid: user.uid,
          type: type,
          amount: finalPrice,
          status: 'success',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          provider_id: providerResponse.id
        });

        return { success: true, orderId: providerResponse.id };
      }
      
      return { success: false, message: providerResponse.error || "Provider error" };
    } catch (error) {
      console.error("Process Order Error:", error);
      return { success: false, message: "An internal error occurred." };
    }
  },

  // Placeholder for your Provider API logic
  async callInlomax(type, details) {
    // Add your Inlomax fetch() call here
    return { success: true, id: "INL_" + Date.now() };
  },

  async callCIPTOPUP(type, details) {
    // Add your CIPTOPUP fetch() call here
    return { success: true, id: "CIP_" + Date.now() };
  }
};