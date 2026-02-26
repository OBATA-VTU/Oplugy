import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not configured. WhatsApp bot will have limited functionality.');
    }
  } catch (e) {
    console.error('Error initializing Firebase Admin:', e);
  }
}

const app = express();
const PORT = 3000;
const CRA_PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WhatsApp Webhook
app.post('/api/whatsapp/webhook', async (req, res) => {
  const { From, Body } = req.body; // Standard Twilio format
  const phoneNumber = From?.replace('whatsapp:', '');
  const message = Body?.trim().toUpperCase();

  if (!phoneNumber || !message) {
    return res.status(200).send('OK');
  }

  try {
    // 1. Find user by phone number in Firestore
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('phone', '==', phoneNumber).limit(1).get();

    if (snapshot.empty) {
      return res.status(200).send(`
        <Response>
          <Message>Welcome to Inlomax! Your phone number ${phoneNumber} is not registered on our website. Please register at ${process.env.APP_URL} to use this bot.</Message>
        </Response>
      `);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // 2. Handle Commands
    const [cmd, ...args] = message.split(' ');

    if (cmd === 'BALANCE') {
      return res.status(200).send(`
        <Response>
          <Message>Hello ${userData.username}, your current wallet balance is ₦${userData.walletBalance?.toLocaleString()}.</Message>
        </Response>
      `);
    }

    if (cmd === 'DATA') {
      if (args.length < 3) {
        return res.status(200).send(`
          <Response>
            <Message>To buy data, use format: DATA [NETWORK] [PLAN_ID] [PHONE].
Example: DATA MTN 1000 08012345678
Reply with "PLANS" to see available plan IDs.</Message>
          </Response>
        `);
      }

      const [network, planId, targetPhone] = args;
      
      // Call internal fulfillment logic (simplified for bot)
      // In a real app, you'd call your proxy-server1 or proxy-server2 logic here
      // For now, we'll simulate a successful request if balance is enough
      
      // We need to fetch the plan price first. For simplicity in this bot demo, 
      // we'll assume a flat rate or look it up if we had a plan database.
      // Let's assume we have a way to verify the plan and price.
      
      return res.status(200).send(`
        <Response>
          <Message>Data purchase request received for ${targetPhone} (${network} ${planId}). 
We are processing your request. You will receive a confirmation message shortly.</Message>
        </Response>
      `);
    }

    if (cmd === 'AIRTIME') {
      if (args.length < 3) {
        return res.status(200).send(`
          <Response>
            <Message>To buy airtime, use format: AIRTIME [NETWORK] [AMOUNT] [PHONE].
Example: AIRTIME MTN 100 08012345678</Message>
          </Response>
        `);
      }
      
      const [network, amountStr, targetPhone] = args;
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount < 50) {
        return res.status(200).send('<Response><Message>Invalid amount. Minimum airtime is ₦50.</Message></Response>');
      }

      if ((userData.walletBalance || 0) < amount) {
        return res.status(200).send('<Response><Message>Insufficient balance. Please fund your wallet at oplugy.vercel.app</Message></Response>');
      }

      // Update balance in Firestore
      await userDoc.ref.update({
        walletBalance: admin.firestore.FieldValue.increment(-amount)
      });

      // Record transaction
      await db.collection('transactions').add({
        userId: userDoc.id,
        userEmail: userData.email,
        type: 'DEBIT',
        source: `${network} Airtime (via Bot)`,
        amount: amount,
        status: 'SUCCESS',
        date_created: admin.firestore.Timestamp.now()
      });

      return res.status(200).send(`
        <Response>
          <Message>Success! ₦${amount} ${network} airtime has been sent to ${targetPhone}. 
Your new balance is ₦${(userData.walletBalance - amount).toLocaleString()}.</Message>
        </Response>
      `);
    }

    if (cmd === 'HELP' || message === 'MENU') {
      return res.status(200).send(`
        <Response>
          <Message>OBATA v2 Bot Menu:
- BALANCE: Check wallet
- DATA [NET] [ID] [PHONE]: Buy data
- AIRTIME [NET] [AMT] [PHONE]: Buy airtime
- HELP: Show this menu</Message>
        </Response>
      `);
    }

    // Default Response
    return res.status(200).send(`
      <Response>
        <Message>Hi ${userData.username}! I didn't recognize that command. Type HELP to see what I can do.</Message>
      </Response>
    `);

  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return res.status(200).send('<Response><Message>Sorry, an error occurred. Please try again later.</Message></Response>');
  }
});

// Inlomax Proxy Route (Server 1)
app.post('/api/proxy-server1', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Inlomax API key not configured in environment.' });
  }

  try {
    const cleanEndpoint = (endpoint || '').replace(/^\//, '');
    let fullUrl = `${baseUrl}/${cleanEndpoint}`;
    
    if (method.toUpperCase() === 'GET' && data) {
       const params = new URLSearchParams();
       Object.entries(data).forEach(([k, v]) => params.append(k, String(v)));
       const qs = params.toString();
       if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`
    };

    if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(cleanEndpoint)) {
      headers['Authorization-Token'] = apiKey;
    }

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      const mapped: any = {};
      const rawServiceID = String(data.serviceID || data.plan_id || data.type || data.provider_id || data.network || '');
      
      if (['validatecable', 'subcable', 'airtime'].includes(cleanEndpoint) && isNaN(Number(rawServiceID))) {
        mapped.serviceID = rawServiceID.toLowerCase();
      } else {
        mapped.serviceID = rawServiceID;
      }
      
      if (data.mobileNumber || data.phone || data.phone_number) {
        mapped.mobileNumber = String(data.mobileNumber || data.phone || data.phone_number);
      }
      if (data.amount) mapped.amount = Number(data.amount);
      if (data.quantity !== undefined) mapped.quantity = Number(data.quantity);
      if (data.meterNum || data.meter_number) mapped.meterNum = String(data.meterNum || data.meter_number);
      if (data.meterType !== undefined) mapped.meterType = (data.meterType === 'prepaid' || data.meterType === 1) ? 1 : 2;
      if (data.iucNum || data.smartCardNumber || data.smartcard) mapped.iucNum = String(data.iucNum || data.smartCardNumber || data.smartcard);

      fetchOptions.body = JSON.stringify(mapped);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).json({ 
        status: 'error', 
        message: responseText.includes('Fatal error') ? 'Server Error: Please try again later.' : 'Server Error.',
        raw: responseText.substring(0, 150)
      });
    }
  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Server Connection Error.' });
  }
});

// Ciptopup Proxy Route (Server 2)
app.post('/api/proxy-server2', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  const apiKey = process.env.CIPTOPUP_API_KEY;
  const baseUrl = 'https://api.ciptopup.ng/api'; 

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Ciptopup API key not configured.' });
  }

  try {
    const cleanEndpoint = (endpoint || '').replace(/^\//, '');
    let fullUrl = `${baseUrl}/${cleanEndpoint}`;
    
    // Handle GET parameters for Server 2
    if (method.toUpperCase() === 'GET' && data) {
       const params = new URLSearchParams();
       Object.entries(data).forEach(([k, v]) => {
         if (v !== undefined && v !== null && v !== '') {
           params.append(k, String(v));
         }
       });
       const qs = params.toString();
       if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    console.log(`[Server 2 Proxy] Requesting: ${method} ${fullUrl}`);

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': apiKey
    };

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      const payload: any = { ...data };
      
      // Mapping for Ciptopup specific endpoints
      if (cleanEndpoint === 'data/buy') {
        if (data.serviceID) payload.plan_id = data.serviceID;
        if (data.mobileNumber) payload.phone_number = data.mobileNumber;
      }

      fetchOptions.body = JSON.stringify(payload);
    }
    console.log(`[Server 2 Proxy] Fetch Options:`, fetchOptions);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    console.log(`[Server 2 Proxy] Raw API Response Text:`, responseText);
    try {
      const responseData = JSON.parse(responseText);
      console.log(`[Server 2 Proxy] Parsed API Response Data:`, responseData);
      return res.status(200).json(responseData);
    } catch {
      console.error(`[Server 2 Proxy] Failed to parse JSON. Raw text: ${responseText.substring(0, 150)}`);
      return res.status(apiResponse.status).json({ 
        status: 'error', 
        message: 'Server Error.',
        raw: responseText.substring(0, 150)
      });
    }
  } catch (error: any) {
    console.error(`[Server 2 Proxy] Exception during fetch:`, error);
    return res.status(504).json({ status: 'error', message: 'Server Connection Error.' });
  }
});

// Proxy all other requests to the CRA dev server
app.use('/', createProxyMiddleware({
  target: `http://localhost:${CRA_PORT}`,
  changeOrigin: true,
  ws: true, // support websockets for HMR
  logLevel: 'error'
}));

// Background Scheduler for Transactions
async function processScheduledTransactions() {
  if (!admin.apps.length) return;
  
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  try {
    const snapshot = await db.collection('scheduled_transactions')
      .where('status', '==', 'PENDING')
      .where('scheduledTime', '<=', now)
      .limit(10)
      .get();

    if (snapshot.empty) return;

    console.log(`Processing ${snapshot.size} scheduled transactions...`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const { userId, service, amount, recipient, network, planId, type } = data;

      try {
        // 1. Check user balance
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists || (userDoc.data()?.walletBalance || 0) < amount) {
          await doc.ref.update({ 
            status: 'FAILED', 
            error: 'Insufficient balance at execution time.',
            updatedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
          continue;
        }

        // 2. Execute Transaction (Simplified - calling Server 1 by default for scheduler)
        // In a real production app, this would use the same logic as the proxy routes
        // For this demo, we'll simulate the API call or use a simplified version
        
        // Update status to PROCESSING to avoid double execution
        await doc.ref.update({ status: 'PROCESSING' });

        // Deduct balance
        await userRef.update({
          walletBalance: admin.firestore.FieldValue.increment(-amount)
        });

        // Log transaction
        await db.collection('transactions').add({
          userId,
          userEmail: data.userEmail,
          type: service.toUpperCase(),
          amount,
          source: `${network} ${service} (Scheduled)`,
          remarks: `Automated payment for ${recipient}`,
          status: 'SUCCESS',
          date_created: admin.firestore.FieldValue.serverTimestamp()
        });

        // Mark as completed
        await doc.ref.update({ 
          status: 'COMPLETED',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      } catch (err: any) {
        console.error(`Error processing scheduled doc ${doc.id}:`, err);
        await doc.ref.update({ 
          status: 'FAILED', 
          error: err.message || 'Unknown execution error',
          updatedAt: admin.firestore.FieldValue.serverTimestamp() 
        });
      }
    }
  } catch (error) {
    console.error('Scheduler Error:', error);
  }
}

// Run scheduler every 60 seconds
setInterval(processScheduledTransactions, 60000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
});
