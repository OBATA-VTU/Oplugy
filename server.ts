import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
      console.warn('FIREBASE_SERVICE_ACCOUNT not configured. Using default credentials.');
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

// Helper functions for API calls
async function callServer1(endpoint: string, method: string, data: any) {
  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  if (!apiKey) {
    throw new Error('Inlomax API key not configured.');
  }

  const cleanEndpoint = (endpoint || '').replace(/^\//, '');
  let fullUrl = `${baseUrl}/${cleanEndpoint}`;
  
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Token ${apiKey}`
  };

  if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(cleanEndpoint)) {
    headers['Authorization-Token'] = apiKey;
  }

  let body: any = undefined;
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

    body = mapped;
  }

  const response = await axios({
    url: fullUrl,
    method: method.toUpperCase(),
    headers,
    params: method.toUpperCase() === 'GET' ? data : undefined,
    data: body,
    timeout: 28000
  });

  return response.data;
}

async function callServer2(endpoint: string, method: string, data: any) {
  const apiKey = process.env.CIPTOPUP_API_KEY;
  const baseUrl = 'https://api.ciptopup.ng/api'; 

  if (!apiKey) {
    throw new Error('Ciptopup API key not configured.');
  }

  const cleanEndpoint = (endpoint || '').replace(/^\//, '');
  let fullUrl = `${baseUrl}/${cleanEndpoint}`;
  
  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': apiKey
  };

  let body: any = undefined;
  if (method.toUpperCase() !== 'GET' && data) {
    const payload: any = { ...data };
    if (cleanEndpoint === 'data/buy') {
      if (data.serviceID) payload.plan_id = data.serviceID;
      if (data.mobileNumber) payload.phone_number = data.mobileNumber;
    }
    body = payload;
  }

  const response = await axios({
    url: fullUrl,
    method: method.toUpperCase(),
    headers,
    params: method.toUpperCase() === 'GET' ? data : undefined,
    data: body,
    timeout: 28000
  });

  return response.data;
}

async function callOgaviral(action: string, data: any = {}) {
  const apiKey = process.env.OGAVIRAL_API_KEY;
  const baseUrl = 'https://ogaviral.com/api/v2';

  if (!apiKey) {
    throw new Error('Ogaviral API key not configured.');
  }

  const params = new URLSearchParams();
  params.append('key', apiKey);
  params.append('action', action);
  
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      params.append(k, String(v));
    }
  });

  const response = await axios({
    url: baseUrl,
    method: 'POST',
    data: params.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 28000
  });

  return response.data;
}

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
          <Message>Welcome to OBATA VTU! Your phone number ${phoneNumber} is not registered on our website. Please register at ${process.env.APP_URL} to use this bot.</Message>
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
      
      try {
        // For simplicity, we'll try to execute via Server 1
        // In a real app, you might need to look up which server has this planId
        const result = await callServer1('data', 'POST', {
          serviceID: network.toLowerCase(),
          plan_id: planId,
          mobileNumber: targetPhone
        });

        if (result.status === 'success' || result.status === true) {
           return res.status(200).send(`
            <Response>
              <Message>Success! Data bundle has been sent to ${targetPhone}.</Message>
            </Response>
          `);
        } else {
          return res.status(200).send(`
            <Response>
              <Message>Failed: ${result.message || 'Provider error'}.</Message>
            </Response>
          `);
        }
      } catch (err: any) {
        return res.status(200).send(`
          <Response>
            <Message>Error: ${err.message}.</Message>
          </Response>
        `);
      }
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
        return res.status(200).send('<Response><Message>Insufficient balance. Please fund your wallet at obata-vtu.run.app</Message></Response>');
      }

      try {
        const result = await callServer1('airtime', 'POST', {
          serviceID: network.toLowerCase(),
          amount: amount,
          mobileNumber: targetPhone
        });

        if (result.status === 'success' || result.status === true) {
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
        } else {
          return res.status(200).send(`
            <Response>
              <Message>Failed: ${result.message || 'Provider error'}.</Message>
            </Response>
          `);
        }
      } catch (err: any) {
        return res.status(200).send(`
          <Response>
            <Message>Error: ${err.message}.</Message>
          </Response>
        `);
      }
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
  try {
    const result = await callServer1(endpoint, method, data);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ciptopup Proxy Route (Server 2)
app.post('/api/proxy-server2', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  try {
    const result = await callServer2(endpoint, method, data);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ogaviral Proxy Route (SMM)
app.post('/api/proxy-smm', async (req, res) => {
  const { action, data } = req.body || {};
  try {
    const result = await callOgaviral(action, data);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Ciptopup Webhook Route
app.post('/api/webhooks/ciptopup', async (req, res) => {
  const secret = process.env.CIPTOPUP_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];

  if (secret && receivedSecret !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = req.body;
  console.log('Ciptopup Webhook Received:', payload);
  
  // Logic to update transaction status in Firestore
  if (admin.apps.length) {
    try {
      const db = admin.firestore();
      const { status, reference, request_id } = payload;
      const txRef = reference || request_id;

      if ((status === 'success' || status === 'completed') && txRef) {
        const txQuery = await db.collection('transactions').where('reference', '==', txRef).limit(1).get();
        if (!txQuery.empty) {
          const txDoc = txQuery.docs[0];
          if (txDoc.data().status === 'PENDING') {
            await txDoc.ref.update({
              status: 'SUCCESS',
              date_updated: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }
    } catch (e) {
      console.error('Webhook DB Error:', e);
    }
  }

  res.status(200).json({ status: 'received' });
});

// Inlomax Webhook Route
app.post('/api/webhooks/inlomax', async (req, res) => {
  const payload = req.body;
  console.log('Inlomax Webhook Received:', payload);
  
  if (admin.apps.length) {
    try {
      const db = admin.firestore();
      const { status, reference, request_id } = payload;
      const txRef = reference || request_id;

      if ((status === 'success' || status === 'completed' || status === 'successful') && txRef) {
        const txQuery = await db.collection('transactions').where('reference', '==', txRef).limit(1).get();
        if (!txQuery.empty) {
          const txDoc = txQuery.docs[0];
          if (txDoc.data().status === 'PENDING') {
            await txDoc.ref.update({
              status: 'SUCCESS',
              date_updated: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }
    } catch (e) {
      console.error('Inlomax Webhook DB Error:', e);
    }
  }

  res.status(200).json({ status: 'received' });
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

    if (snapshot.empty) {
      console.log('No pending scheduled transactions found.');
      return;
    }

    console.log(`Processing ${snapshot.size} scheduled transactions...`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const { userId, service, amount, recipient, network, planId, type } = data;
      console.log(`Processing scheduled transaction ${doc.id} for user ${userId} - ${service} to ${recipient}`);

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

        // 2. Execute Transaction
        // Update status to PROCESSING to avoid double execution
        await doc.ref.update({ status: 'PROCESSING' });

        let endpoint = '';
        let payload: any = {
          amount: amount,
          mobileNumber: recipient
        };

        switch (service.toLowerCase()) {
          case 'data':
            endpoint = 'data';
            payload.serviceID = planId;
            break;
          case 'airtime':
            endpoint = 'airtime';
            payload.serviceID = network.toLowerCase();
            break;
          case 'cable':
            endpoint = 'subcable';
            payload.serviceID = planId;
            payload.iucNum = recipient;
            break;
          case 'power':
            endpoint = 'payelectric';
            payload.serviceID = network.toLowerCase();
            payload.meterNum = recipient;
            payload.meterType = data.meterType || 1;
            break;
          default:
            endpoint = service.toLowerCase();
            payload.serviceID = planId || network.toLowerCase();
        }

        const result = await callServer1(endpoint, 'POST', payload);

        if (result.status === 'success' || result.status === true) {
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
        } else {
          throw new Error(result.message || 'Provider rejected scheduled request');
        }

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
