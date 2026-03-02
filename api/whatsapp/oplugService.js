import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp();
    }
  } catch (e) { console.error('--- [DEBUG] Firebase Init Error:', e); }
}

const db = admin.firestore();

export const oplugService = {
  async lookupUser(whatsappPhone) {
    try {
      const localPhone = whatsappPhone.startsWith('234') ? '0' + whatsappPhone.substring(3) : whatsappPhone;
      
      // Search for both formats
      const snapshot = await db.collection('users').where('phone', 'in', [whatsappPhone, localPhone]).limit(1).get();
      
      if (snapshot.empty) {
        console.log(`--- [DEBUG] No user found for phone: ${whatsappPhone} or ${localPhone}`);
        return { exists: false };
      }
      
      const data = snapshot.docs[0].data();
      console.log("--- [DEBUG] Raw Firestore Data:", JSON.stringify(data));

      // Try to find the name in different fields
      const name = data.username || data.name || data.fullName || data.email?.split('@')[0] || "User";
      
      return { 
        exists: true, 
        uid: snapshot.docs[0].id, 
        name: name, 
        balance: parseFloat(data.walletBalance || data.balance || 0) 
      };
    } catch (error) { 
      console.error("--- [DEBUG] Lookup Error:", error);
      return { exists: false }; 
    }
  },

  // ... (Keep your callServer1, callServer2, and generatePaymentDetails logic here)
};