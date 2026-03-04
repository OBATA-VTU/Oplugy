import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as admin from 'firebase-admin';
import axios from 'axios';
import crypto from 'crypto';
import handleWhatsAppWebhook from './src/whatsapp/webhook';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      console.log(`Initializing Firebase Admin with project: ${serviceAccount.project_id}`);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
      console.warn('FIREBASE_SERVICE_ACCOUNT not configured. Using default credentials.');
      try {
        const app = admin.app();
        console.log(`Default Firebase project ID: ${app.options.projectId || 'unknown'}`);
      } catch (e) {}
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

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  const db = admin.firestore();
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) {
    return res.status(404).json({ status: false, message: 'User not found.' });
  }
  const userData = snapshot.docs[0].data();
  return res.status(200).json({ status: true, data: { id: snapshot.docs[0].id, ...userData } });
});

app.post('/api/auth/signup', async (req, res) => {
  const userData = req.body;
  const db = admin.firestore();
  const existing = await db.collection('users').where('email', '==', userData.email).limit(1).get();
  if (!existing.empty) {
    return res.status(400).json({ status: false, message: 'User already exists.' });
  }
  const newUser = {
    ...userData,
    walletBalance: 0,
    role: 'User',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  const docRef = await db.collection('users').add(newUser);
  return res.status(201).json({ status: true, data: { id: docRef.id, ...newUser } });
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      const newUser = {
        username: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
        email: userRecord.email,
        phone: userRecord.phoneNumber || '',
        walletBalance: 0,
        role: 'User',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(decodedToken.uid).set(newUser);
      return res.status(200).json({ status: true, data: { id: decodedToken.uid, ...newUser } });
    }
    return res.status(200).json({ status: true, data: { id: userDoc.id, ...userDoc.data() } });
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Invalid token' });
  }
});

// --- Service Sync Endpoint ---
app.post("/api/admin/sync-services", async (req, res) => {
  try {
    const apiKey = process.env.INLOMAX_API_KEY;
    const response = await axios.get('https://inlomax.com/api/services', {
      headers: { 
        'Authorization': `Token ${apiKey}`, 
        'Authorization-Token': apiKey,
        'Accept': 'application/json'
      }
    });

    if (response.data.status === 'success' && response.data.data?.dataPlans) {
      const plans = response.data.data.dataPlans;
      const db = admin.firestore();
      const batch = db.batch();

      for (const plan of plans) {
        const planRef = db.collection('manual_pricing').doc(String(plan.serviceID));
        batch.set(planRef, {
          plan_id: String(plan.serviceID),
          plan_name: plan.dataPlan,
          network: plan.network,
          type: plan.dataType,
          base_price: Number(String(plan.amount).replace(/,/g, '')),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      return res.json({ status: true, message: `Successfully synced ${plans.length} services.` });
    }
    res.status(400).json({ status: false, message: 'Failed to fetch services from provider.' });
  } catch (error: any) {
    console.error('Sync Error:', error.response?.data || error.message);
    res.status(500).json({ status: false, message: error.message });
  }
});

// --- Consolidated VTU Info Endpoint ---
app.get("/api/vtu/info", async (req, res) => {
  const { action, network, type, server } = req.query;
  const selectedServer = Number(server) || 1;

  try {
    if (action === 'plans') {
      if (selectedServer === 1) {
        const apiKey = process.env.INLOMAX_API_KEY;
        const response = await axios.get('https://inlomax.com/api/services', {
          headers: { 
            'Authorization': `Token ${apiKey}`, 
            'Authorization-Token': apiKey,
            'Accept': 'application/json'
          }
        });
        if (response.data.status === 'success' && response.data.data?.dataPlans) {
          let plans = response.data.data.dataPlans;
          if (network) {
            plans = plans.filter((p: any) => p.network?.toUpperCase() === String(network).toUpperCase());
          }
          return res.json({ status: true, data: plans });
        }
      }
    }
    res.status(400).json({ status: false, message: 'Invalid request' });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// --- Consolidated VTU Purchase Endpoint ---
app.post("/api/vtu/purchase", async (req, res) => {
  const { userId, service, details } = req.body;
  if (!userId || !service || !details) {
    return res.status(400).json({ status: false, message: 'Missing parameters' });
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData || userData.walletBalance < details.amount) {
      return res.status(400).json({ status: false, message: 'Insufficient balance or user not found' });
    }

    // Execute via Inlomax
    const result = await callServer1(service, 'POST', details.payload);

    if (result.status === 'success' || result.status === true) {
      await userRef.update({ walletBalance: admin.firestore.FieldValue.increment(-details.amount) });
      await db.collection('transactions').add({
        userId, 
        userEmail: userData.email, 
        type: service.toUpperCase(),
        amount: details.amount, 
        status: 'SUCCESS', 
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ status: true, message: 'Success', data: result.data });
    }
    res.status(400).json({ status: false, message: result.message || 'Failed' });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// --- General Proxy Endpoint ---
app.all('/api/proxy', async (req, res) => {
  const { server: serverQuery } = req.query;
  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method = 'GET', data, server: serverBody } = payload || {};
  const server = serverQuery || serverBody || '1';

  try {
    let result;
    if (server === '1') {
      result = await callServer1(endpoint, method, data);
    } else if (server === 'smm') {
      result = await callOgaviral(endpoint || 'services', data);
    } else if (server === 'paystack') {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;
      const response = await axios({
        url: `https://api.paystack.co/${(endpoint || '').replace(/^\//, '')}`,
        method: method.toUpperCase(),
        headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        data: method.toUpperCase() !== 'GET' ? data : undefined,
        params: method.toUpperCase() === 'GET' ? data : undefined
      });
      result = response.data;
    } else if (server === 'billstack') {
      const secretKey = process.env.BILLSTACK_SECRET_KEY;
      const response = await axios({
        url: `https://api.billstack.co/${(endpoint || '').replace(/^\//, '')}`,
        method: method.toUpperCase(),
        headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        data: method.toUpperCase() !== 'GET' ? data : undefined,
        params: method.toUpperCase() === 'GET' ? data : undefined
      });
      result = response.data;
    } else {
      return res.status(400).json({ status: false, message: 'Invalid server' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Ogaviral Proxy Route (SMM)
app.post('/api/proxy-smm', async (req, res) => {
  const { action, data } = req.body || {};
  console.log(`SMM Proxy Request: action=${action}`, data);
  try {
    const result = await callOgaviral(action, data);
    console.log(`SMM Proxy Response:`, result);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`SMM Proxy Error:`, error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
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

// Paystack Webhook
app.post('/api/paystack-webhook', async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ message: 'Paystack secret not configured' });
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.status(401).json({ message: 'Invalid signature' });
  
  const event = req.body;
  if (event.event === 'charge.success') {
    const data = event.data;
    const amount = data.amount / 100;
    const email = data.customer.email;
    const db = admin.firestore();
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!snapshot.empty) {
      const userRef = snapshot.docs[0].ref;
      await userRef.update({ walletBalance: admin.firestore.FieldValue.increment(amount) });
      await db.collection('transactions').add({
        userId: userRef.id, userEmail: email, type: 'CREDIT', amount, source: 'Paystack', status: 'SUCCESS',
        reference: data.reference, date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  res.status(200).json({ status: 'received' });
});

// Billstack Webhook
app.post('/api/billstack-webhook', async (req, res) => {
  const secret = process.env.BILLSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ message: 'Billstack secret not configured' });
  const expectedSignature = crypto.createHash('md5').update(secret).digest('hex');
  if (req.headers['x-wiaxy-signature'] !== expectedSignature) return res.status(401).json({ message: 'Invalid signature' });

  const payload = req.body;
  if (payload.event === 'PAYMENT_NOTIFIFICATION' && payload.data?.type === 'RESERVED_ACCOUNT_TRANSACTION') {
    const data = payload.data;
    const amount = parseFloat(data.amount);
    const db = admin.firestore();
    const accountNumber = data.account?.account_number;
    const snapshot = await db.collection('users').where('virtualAccount.account_number', '==', accountNumber).limit(1).get();
    if (!snapshot.empty) {
      const userRef = snapshot.docs[0].ref;
      const userData = snapshot.docs[0].data();
      await userRef.update({ walletBalance: admin.firestore.FieldValue.increment(amount) });
      await db.collection('transactions').add({
        userId: userRef.id, userEmail: userData.email, type: 'CREDIT', amount, source: 'Virtual Account', status: 'SUCCESS',
        reference: data.reference, date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  res.status(200).json({ status: 'received' });
});

// Proxy all other requests to the CRA dev server in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${CRA_PORT}`,
    changeOrigin: true,
    ws: true // support websockets for HMR
  }));
}

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
const startScheduler = async () => {
  try {
    const db = admin.firestore();
    // Test connection
    await db.collection('settings').limit(1).get();
    console.log('Firestore connection successful. Starting scheduler...');
    setInterval(processScheduledTransactions, 60000);
  } catch (error: any) {
    console.error('Failed to connect to Firestore. Scheduler will not run:', error.message);
  }
};

startScheduler();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
});

export default app;
