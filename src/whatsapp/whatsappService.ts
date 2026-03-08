import * as admin from 'firebase-admin';
import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const getAppUrl = () => {
  const url = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  if (!url) {
    console.warn('[WhatsApp Service] Warning: APP_URL is not set. Internal API calls may fail.');
  }
  return url.replace(/\/$/, '');
};

export const whatsappService = {
  /**
   * Send a text message via Meta's WhatsApp Business API
   */
  sendMessage: async (to: string, text: string) => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.error('[WhatsApp Service] Credentials missing (TOKEN/ID). Cannot send message.');
      return;
    }

    console.log(`[WhatsApp Service] Sending message to ${to}: ${text.substring(0, 100)}...`);
    try {
      const response = await axios.post(
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
      console.log(`[WhatsApp Service] Message sent successfully. ID: ${response.data.messages?.[0]?.id}`);
    } catch (error: any) {
      console.error('[WhatsApp Service] Error sending message:', error.response?.data || error.message);
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
   * Initialize Paystack Payment (Bank Transfer)
   */
  initializePaystackPayment: async (email: string, amount: number, metadata: any = {}) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Paystack Secret Key not configured.');

    try {
      // Try to use Charge API for bank transfer first
      const response = await axios.post(
        'https://api.paystack.co/charge',
        {
          email,
          amount: Math.round(amount * 100),
          metadata: { ...metadata, source: 'whatsapp_bot' },
          bank: {
            code: "057", // Example: Zenith Bank, but usually Paystack handles this
            account_number: "0000000000" // Placeholder
          },
          channels: ["bank_transfer"]
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      ).catch(async (err) => {
        // Fallback to standard initialization if Charge API fails or is not enabled for this account
        const initRes = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          {
            email,
            amount: Math.round(amount * 100),
            metadata: { ...metadata, source: 'whatsapp_bot' },
            callback_url: `${getAppUrl()}/payment/verify`,
            channels: ["card", "bank_transfer"]
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return initRes;
      });

      return response.data;
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Generate Virtual Account via Billstack (Single-step v2)
   */
  generateVirtualAccount: async (payload: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    phone: string; 
    reference: string;
  }) => {
    const secretKey = process.env.BILLSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Billstack Secret Key not configured.');

    try {
      // Use the single-step v2 endpoint as per latest documentation
      const response = await axios.post(
        'https://api.billstack.co/v2/thirdparty/generateVirtualAccount/',
        {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          bank: 'PALMPAY',
          reference: payload.reference
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
      console.error('Billstack generation error:', error.response?.data || error.message);
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
    const cleanPhone = phone.replace(/\D/g, '');
    const formats = [
      cleanPhone, 
      cleanPhone.replace(/^234/, '0'), 
      cleanPhone.replace(/^0/, '234'),
      `+${cleanPhone}`,
      `+${cleanPhone.replace(/^234/, '0')}`
    ];
    
    for (const f of formats) {
      // Check 'phone' field
      let snapshot = await db.collection('users').where('phone', '==', f).limit(1).get();
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
      }
      
      // Check 'phoneNumber' field
      snapshot = await db.collection('users').where('phoneNumber', '==', f).limit(1).get();
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
      }
    }
    
    // Last resort: search by email if we can find it in session or something, 
    // but usually phone is the primary key for WhatsApp.
    return null;
  },

  /**
   * Fetch Cable providers from website API
   */
  getCableProviders: async () => {
    try {
      const response = await axios.get(`${getAppUrl()}/api/vtu/info?action=providers&type=CABLE`);
      const res = response.data;
      if (!res.status) return [];
      return res.data.map((name: string) => ({
        id: name,
        title: name,
        description: `${name} TV Subscription`
      }));
    } catch (e) { return []; }
  },

  /**
   * Fetch Electricity providers from website API
   */
  getElectricityProviders: async () => {
    try {
      const response = await axios.get(`${getAppUrl()}/api/vtu/info?action=providers&type=POWER`);
      const res = response.data;
      if (!res.status) return [];
      return res.data.map((name: string) => ({
        id: name,
        title: name,
        description: `${name} Electricity`
      }));
    } catch (e) { return []; }
  },

  /**
   * Verify IUC or Meter Number via website API
   */
  verifyNumber: async (type: 'CABLE' | 'POWER', provider: string, number: string) => {
    // For now, we still call Inlomax directly for validation if no local endpoint exists, 
    // but the user wants it from the website. Let's assume the website has a validation endpoint.
    const endpoint = type === 'CABLE' ? 'validatecable' : 'validatemeter';
    const payload = type === 'CABLE' 
      ? { serviceID: provider.toLowerCase(), iucNum: number }
      : { serviceID: provider.toLowerCase(), meterNum: number, meterType: 1 };

    try {
      const response = await axios.post(`${getAppUrl()}/api/proxy?server=1&endpoint=${endpoint}`, payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Get plans for interactive list from website API
   */
  getPlansForList: async (network: string, type: 'DATA' | 'AIRTIME' | 'CABLE' | 'POWER', server: number = 1) => {
    if (type === 'DATA') {
      try {
        const response = await axios.get(`${getAppUrl()}/api/vtu/info?action=plans&server=${server}&network=${network}`);
        const res = response.data;
        if (!res.status || !res.data) return [];

        return res.data.map((p: any) => {
          const planId = p.serviceID || p.id || p.plan_id;
          const planName = p.dataPlan || p.name || p.plan_name;
          const amount = p.amount || p.price;
          return {
            id: `PLAN_${planId}`,
            title: `${planName}`,
            description: `Price: ₦${amount} | ID: ${planId}`
          };
        });
      } catch (e) { return []; }
    }
    
    if (type === 'AIRTIME') {
      return [
        { id: 'AMT_100', title: '₦100', description: 'Top up ₦100' },
        { id: 'AMT_200', title: '₦200', description: 'Top up ₦200' },
        { id: 'AMT_500', title: '₦500', description: 'Top up ₦500' },
        { id: 'AMT_1000', title: '₦1,000', description: 'Top up ₦1,000' },
        { id: 'AMT_CUSTOM', title: 'Custom Amount', description: 'Enter amount manually' }
      ];
    }

    if (type === 'CABLE') {
      try {
        const response = await axios.get(`${getAppUrl()}/api/vtu/info?action=plans&server=1&network=${network}&type=CABLE`);
        const res = response.data;
        if (!res.status || !res.data) return [];
        return res.data.map((p: any) => ({
          id: `PLAN_${p.serviceID}`,
          title: `${p.plan_name || p.name}`,
          description: `Price: ₦${p.user_price || p.amount}`
        }));
      } catch (e) { return []; }
    }

    return [];
  },

  /**
   * Execute a purchase via website API
   */
  executePurchase: async (userId: string, service: string, details: any) => {
    try {
      const response = await axios.post(`${getAppUrl()}/api/vtu/purchase`, {
        userId,
        service,
        details,
        server: details.server || 1
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }
};
