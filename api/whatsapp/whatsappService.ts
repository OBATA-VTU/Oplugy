import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  } catch (e) {
    console.error('Error initializing Firebase Admin in WhatsApp Service:', e);
  }
}

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const INLOMAX_API_KEY = process.env.INLOMAX_API_KEY;
const INLOMAX_BASE_URL = 'https://inlomax.com/api';

export const whatsappService = {
  /**
   * Send a text message via Meta's WhatsApp Business API
   */
  sendMessage: async (to: string, text: string) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('WhatsApp credentials missing.');
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    }
  },

  /**
   * Find user by phone number in Firestore
   */
  getUserByPhone: async (phone: string) => {
    const db = admin.firestore();
    // Try different formats of the phone number
    const formats = [phone, phone.replace(/^234/, '0'), phone.replace(/^0/, '234')];
    
    for (const f of formats) {
      const snapshot = await db.collection('users').where('phone', '==', f).limit(1).get();
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
      }
    }
    return null;
  },

  /**
   * Fetch all data plans and their current prices (including manual pricing)
   */
  getAvailablePlans: async (network: string) => {
    const db = admin.firestore();
    const normalizedNetwork = network.toUpperCase();
    
    // In a real app, we'd fetch from the VTU provider API too.
    // For now, we'll fetch manual pricing to see what's set.
    const pricingSnap = await db.collection('manual_pricing').get();
    const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Filter plans for the requested network
    // Note: This is a simplified version. In a real app, you'd fetch the full plan list from the provider.
    const networkPlans = manualPricing.filter((p: any) => 
      p.planId && p.planId.includes(normalizedNetwork)
    );

    if (networkPlans.length === 0) {
      return `No plans found for ${normalizedNetwork}. Please check our website for available plans.`;
    }

    let message = `*Available ${normalizedNetwork} Plans:*\n\n`;
    networkPlans.forEach((p: any) => {
      // Extract the numeric ID from the planId (e.g., "s1-MTN-123" -> "123")
      const idParts = p.planId.split('-');
      const displayId = idParts[idParts.length - 1];
      message += `• *ID:* ${displayId}\n  *Price:* ₦${p.user_price}\n\n`;
    });
    
    message += `To buy: *DATA ${normalizedNetwork} [ID] [PHONE]*`;
    return message;
  },

  /**
   * Execute a purchase (Data or Airtime)
   */
  executePurchase: async (userId: string, service: string, details: any) => {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) throw new Error('User not found.');
    if (userData.walletBalance < details.amount) throw new Error('Insufficient balance.');

    // Call Inlomax API (Server 1)
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${INLOMAX_API_KEY}`
    };

    if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(service)) {
      headers['Authorization-Token'] = INLOMAX_API_KEY;
    }

    const response = await axios({
      url: `${INLOMAX_BASE_URL}/${service}`,
      method: 'POST',
      headers,
      data: details.payload
    });

    const result = response.data;

    if (result.status === 'success' || result.status === true) {
      // Deduct balance
      await userRef.update({
        walletBalance: admin.firestore.FieldValue.increment(-details.amount)
      });

      // Record transaction
      await db.collection('transactions').add({
        userId,
        userEmail: userData.email,
        type: service.toUpperCase(),
        amount: details.amount,
        source: `${details.network} ${service} (WhatsApp Bot)`,
        status: 'SUCCESS',
        date_created: admin.firestore.FieldValue.serverTimestamp(),
        server: 'Oplug WhatsApp Node'
      });

      return { status: true, message: 'Transaction successful.' };
    } else {
      throw new Error(result.message || 'Provider error.');
    }
  }
};
