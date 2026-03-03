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
   * Send interactive buttons
   */
  sendInteractiveButtons: async (to: string, bodyText: string, buttons: { id: string, title: string }[]) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map(b => ({
                type: 'reply',
                reply: { id: b.id, title: b.title }
              }))
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error sending interactive buttons:', error.response?.data || error.message);
    }
  },

  /**
   * Send interactive list
   */
  sendInteractiveList: async (to: string, bodyText: string, buttonLabel: string, sections: { title: string, rows: { id: string, title: string, description?: string }[] }[]) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
              button: buttonLabel,
              sections: sections
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error sending interactive list:', error.response?.data || error.message);
    }
  },

  /**
   * Initialize Paystack Payment
   */
  initializePaystackPayment: async (email: string, amount: number, metadata: any = {}) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Paystack Secret Key not configured.');

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: Math.round(amount * 100), // convert to kobo
          metadata: {
            ...metadata,
            source: 'whatsapp_bot'
          },
          callback_url: `${process.env.APP_URL}/payment/verify`
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Session Management
   */
  getSession: async (phone: string) => {
    const db = admin.firestore();
    const doc = await db.collection('whatsapp_sessions').doc(phone).get();
    return doc.exists ? doc.data() : null;
  },

  updateSession: async (phone: string, data: any) => {
    const db = admin.firestore();
    await db.collection('whatsapp_sessions').doc(phone).set({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  },

  clearSession: async (phone: string) => {
    const db = admin.firestore();
    await db.collection('whatsapp_sessions').doc(phone).delete();
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
    
    const pricingSnap = await db.collection('manual_pricing').get();
    const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const networkPlans = manualPricing.filter((p: any) => 
      p.planId && p.planId.includes(normalizedNetwork)
    );

    if (networkPlans.length === 0) {
      return `No plans found for ${normalizedNetwork}. Please check our website for available plans.`;
    }

    let message = `*Available ${normalizedNetwork} Plans:*\n\n`;
    networkPlans.forEach((p: any) => {
      const idParts = p.planId.split('-');
      const displayId = idParts[idParts.length - 1];
      message += `• *ID:* ${displayId}\n  *Price:* ₦${p.user_price}\n\n`;
    });
    
    message += `To buy: *DATA ${normalizedNetwork} [ID] [PHONE]*`;
    return message;
  },

  /**
   * Fetch Cable providers
   */
  getCableProviders: async () => {
    const db = admin.firestore();
    const pricingSnap = await db.collection('manual_pricing').get();
    const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const cablePlans = manualPricing.filter((p: any) => p.planId && p.planId.includes('CABLE'));
    const providers = Array.from(new Set(cablePlans.map((p: any) => p.planId.split('-')[1]))).map(name => ({
      id: name,
      title: name,
      description: `${name} TV Subscription`
    }));
    return providers;
  },

  /**
   * Fetch Electricity providers
   */
  getElectricityProviders: async () => {
    const db = admin.firestore();
    const pricingSnap = await db.collection('manual_pricing').get();
    const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const powerPlans = manualPricing.filter((p: any) => p.planId && p.planId.includes('POWER'));
    const providers = Array.from(new Set(powerPlans.map((p: any) => p.planId.split('-')[1]))).map(name => ({
      id: name,
      title: name,
      description: `${name} Electricity`
    }));
    return providers;
  },

  /**
   * Verify IUC or Meter Number
   */
  verifyNumber: async (type: 'CABLE' | 'POWER', provider: string, number: string) => {
    const secretKey = process.env.INLOMAX_API_KEY;
    const endpoint = type === 'CABLE' ? 'validatecable' : 'validatemeter';
    const payload = type === 'CABLE' 
      ? { serviceID: provider.toLowerCase(), iucNum: number }
      : { serviceID: provider.toLowerCase(), meterNum: number, meterType: 1 }; // Default to prepaid

    try {
      const response = await axios.post(`${INLOMAX_BASE_URL}/${endpoint}`, payload, {
        headers: {
          'Authorization': `Token ${secretKey}`,
          'Authorization-Token': secretKey,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Verification error (${type}):`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get plans for interactive list
   */
  getPlansForList: async (network: string, type: 'DATA' | 'AIRTIME' | 'CABLE' | 'POWER') => {
    const db = admin.firestore();
    const normalizedNetwork = network.toUpperCase();
    
    if (type === 'DATA') {
      const pricingSnap = await db.collection('manual_pricing').get();
      const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const networkPlans = manualPricing.filter((p: any) => 
        p.planId && p.planId.includes(normalizedNetwork)
      );

      return networkPlans.map((p: any) => {
        const idParts = p.planId.split('-');
        const displayId = idParts[idParts.length - 1];
        return {
          id: `PLAN_${p.planId}`,
          title: `${p.plan_name || 'Data Plan'}`,
          description: `Price: ₦${p.user_price} | ID: ${displayId}`
        };
      });
    }
    
    // For Airtime, we might just need a text input for amount, but let's provide common amounts
    if (type === 'AIRTIME') {
      return [
        { id: 'AMT_100', title: '₦100', description: 'Top up ₦100' },
        { id: 'AMT_200', title: '₦200', description: 'Top up ₦200' },
        { id: 'AMT_500', title: '₦500', description: 'Top up ₦500' },
        { id: 'AMT_1000', title: '₦1,000', description: 'Top up ₦1,000' },
        { id: 'AMT_2000', title: '₦2,000', description: 'Top up ₦2,000' },
        { id: 'AMT_5000', title: '₦5,000', description: 'Top up ₦5,000' },
        { id: 'AMT_CUSTOM', title: 'Custom Amount', description: 'Enter amount manually' }
      ];
    }

    if (type === 'CABLE') {
      const pricingSnap = await db.collection('manual_pricing').get();
      const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const cablePlans = manualPricing.filter((p: any) => 
        p.planId && p.planId.includes('CABLE') && p.planId.includes(normalizedNetwork)
      );

      return cablePlans.map((p: any) => {
        return {
          id: `PLAN_${p.planId}`,
          title: `${p.plan_name || 'Cable Plan'}`,
          description: `Price: ₦${p.user_price}`
        };
      });
    }

    return [];
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
      await userRef.update({
        walletBalance: admin.firestore.FieldValue.increment(-details.amount)
      });

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
