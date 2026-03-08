import express from 'express';
import cors from 'cors';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as admin from 'firebase-admin';
import axios from 'axios';
import crypto from 'crypto';
import handleWhatsAppWebhook from './src/whatsapp/webhook';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const saString = (process.env.FIREBASE_SERVICE_ACCOUNT || '{}').trim();
    let serviceAccount: any;
    try {
      // Remove potential wrapping quotes from Vercel env vars
      const cleanSaString = saString.replace(/^'|'$/g, '').replace(/^"|"$/g, '');
      serviceAccount = JSON.parse(cleanSaString);
    } catch (parseError) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError);
      serviceAccount = {};
    }

    if (serviceAccount.private_key) {
      // Fix escaped newlines in private key
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'oplug-vtu';
    
    if (serviceAccount.project_id && serviceAccount.private_key) {
      console.log(`[Firebase Admin] Initializing with Service Account for project: ${projectId}`);
      console.log(`[Firebase Admin] Client Email: ${serviceAccount.client_email}`);
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId
        });
      } catch (initErr: any) {
        console.error(`[Firebase Admin] Initialization Error:`, initErr.message);
      }
    } else {
      console.warn(`[Firebase Admin] WARNING: Missing service account credentials (project_id or private_key). Firestore operations will likely fail with PERMISSION_DENIED.`);
      admin.initializeApp({ projectId: projectId });
    }
    admin.firestore().settings({ ignoreUndefinedProperties: true });
    console.log(`Firebase Admin initialized successfully for project: ${projectId}`);
  } catch (e) {
    console.error('Error initializing Firebase Admin:', e);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const CRA_PORT = 3001;

console.log(`[Server] Starting Oplug API Gateway...`);
console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[Server] Vercel Environment: ${process.env.VERCEL ? 'Yes' : 'No'}`);

// Set APP_URL for Vercel and other environments
if (!process.env.APP_URL && process.env.VERCEL_URL) {
  process.env.APP_URL = `https://${process.env.VERCEL_URL}`;
}
console.log(`[Server] APP_URL: ${process.env.APP_URL || 'Not set'}`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  console.log(`[Health Check] API is alive at ${new Date().toISOString()}`);
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// WhatsApp Webhook Route
app.all('/api/whatsapp/webhook', async (req, res) => {
  console.log(`[WhatsApp Webhook] ${req.method} request received at ${new Date().toISOString()}`);
  try {
    await handleWhatsAppWebhook(req, res);
  } catch (error: any) {
    console.error('[WhatsApp Webhook] Fatal Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
});

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
    'Accept': 'application/json'
  };

  // Specific headers based on Inlomax documentation
  if (['subcable', 'payelectric'].includes(cleanEndpoint)) {
    headers['Authorization-Token'] = apiKey;
  } else {
    headers['Authorization'] = `Token ${apiKey}`;
  }

  let body: any = undefined;
  if (method.toUpperCase() !== 'GET' && data) {
    body = { ...data };
    // Map common fields to Inlomax expected fields
    if (data.plan_id && !data.serviceID) body.serviceID = data.plan_id;
    if (data.phone && !data.mobileNumber) body.mobileNumber = data.phone;
    if (data.number && !data.mobileNumber && !['subcable', 'payelectric', 'validatecable', 'validatemeter'].includes(cleanEndpoint)) body.mobileNumber = data.number;
    
    if (cleanEndpoint === 'subcable' || cleanEndpoint === 'validatecable') {
       if (data.number && !data.iucNum) body.iucNum = data.number;
    }
    if (cleanEndpoint === 'payelectric' || cleanEndpoint === 'validatemeter') {
       if (data.number && !data.meterNum) body.meterNum = data.number;
    }
  }

  console.log(`Calling Server 1: ${method} ${fullUrl}`, JSON.stringify(body));

  try {
    const response = await axios({
      url: fullUrl,
      method: method.toUpperCase(),
      headers,
      params: method.toUpperCase() === 'GET' ? data : undefined,
      data: body,
      timeout: 30000
    });
    console.log(`Server 1 Response:`, JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    console.error(`Server 1 Error (${fullUrl}):`, error.response?.data || error.message);
    throw error;
  }
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

  console.log(`Calling Ogaviral: ${baseUrl} action=${action}`, data);

  try {
    const response = await axios.post(baseUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log(`Ogaviral Response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ogaviral Error:', error.response?.data || error.message);
    throw error;
  }
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

    if (response.data.status === 'success' && response.data.data) {
      const { dataPlans = [], cablePlans = [], electricityPlans = [] } = response.data.data;
      const db = admin.firestore();
      const batch = db.batch();

      // Sync Data Plans
      for (const plan of dataPlans) {
        if (!plan.serviceID) continue;
        const planRef = db.collection('manual_pricing').doc(String(plan.serviceID));
        batch.set(planRef, {
          plan_id: String(plan.serviceID),
          plan_name: plan.dataPlan || plan.plan_name || 'Unknown Data Plan',
          network: plan.network || 'Unknown',
          type: 'DATA',
          dataType: plan.dataType || 'SME',
          base_price: Number(String(plan.amount || 0).replace(/,/g, '')),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      // Sync Cable Plans
      for (const plan of cablePlans) {
        if (!plan.serviceID) continue;
        const planRef = db.collection('manual_pricing').doc(String(plan.serviceID));
        batch.set(planRef, {
          plan_id: String(plan.serviceID),
          plan_name: plan.plan_name || plan.dataPlan || 'Unknown Cable Plan',
          network: plan.network || 'Unknown',
          type: 'CABLE',
          base_price: Number(String(plan.amount || 0).replace(/,/g, '')),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      // Sync Electricity Plans
      for (const plan of electricityPlans) {
        if (!plan.serviceID) continue;
        const planRef = db.collection('manual_pricing').doc(String(plan.serviceID));
        batch.set(planRef, {
          plan_id: String(plan.serviceID),
          plan_name: plan.plan_name || plan.dataPlan || 'Unknown Power Plan',
          network: plan.network || 'Unknown',
          type: 'POWER',
          base_price: Number(String(plan.amount || 0).replace(/,/g, '')),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      return res.json({ status: true, message: `Successfully synced ${dataPlans.length + cablePlans.length + electricityPlans.length} services.` });
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
    } else if (action === 'providers') {
      // Return hardcoded providers for now to ensure stability
      if (type === 'CABLE') {
        return res.json({ status: true, data: ['DSTV', 'GOTV', 'STARTIMES'] });
      } else if (type === 'POWER') {
        return res.json({ status: true, data: ['IKEDC', 'EKEDC', 'AEDC', 'PHEDC', 'JEDC', 'KAEDCO', 'KEDCO', 'EEDC', 'IBEDC'] });
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
      if (!secretKey) {
        console.error('[Billstack Proxy] Error: BILLSTACK_SECRET_KEY is not configured in environment variables.');
        return res.status(500).json({ status: false, message: 'Billstack API key not configured on server.' });
      }
      
      const baseUrl = 'https://api.billstack.co';
      const cleanEndpoint = (endpoint || '').replace(/^\//, '');
      
      try {
        const fullUrl = `${baseUrl}/${cleanEndpoint}`;
        console.log(`[Billstack Proxy] Calling: ${method.toUpperCase()} ${fullUrl}`, JSON.stringify(data));
        
        const response = await axios({
          url: fullUrl,
          method: method.toUpperCase(),
          headers: { 
            'Authorization': `Bearer ${secretKey}`, 
            'Content-Type': 'application/json',
            'User-Agent': 'Oplug-API-Gateway/2.0'
          },
          data: method.toUpperCase() !== 'GET' ? data : undefined,
          params: method.toUpperCase() === 'GET' ? data : undefined,
          timeout: 30000
        });
        result = response.data;
        console.log(`[Billstack Proxy] Success Response:`, JSON.stringify(result).substring(0, 200));
      } catch (axiosError: any) {
        const errorData = axiosError.response?.data;
        const isHtml = typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>');
        const errorMessage = isHtml ? 'Billstack API returned HTML (likely 404 or 500). Check endpoint URL.' : (errorData || axiosError.message);
        
        console.error(`[Billstack Proxy] API Error:`, errorMessage);
        return res.status(axiosError.response?.status || 500).json({
          status: false,
          message: isHtml ? 'Internal Provider Error (HTML returned)' : (typeof errorMessage === 'string' ? errorMessage : 'Billstack API Error'),
          details: isHtml ? undefined : errorData
        });
      }
    } else {
      return res.status(400).json({ status: false, message: 'Invalid server' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Specific Proxy Routes for Backward Compatibility
app.all('/api/proxy-server1', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  try {
    const result = await callServer1(endpoint, method, data);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.all('/api/proxy-server2', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  try {
    // Server 2 is currently disabled or using Server 1 as fallback
    const result = await callServer1(endpoint, method, data);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.all('/api/proxy-smm', async (req, res) => {
  const { action, data } = req.body || {};
  try {
    const result = await callOgaviral(action || 'services', data || {});
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// SMM Balance Endpoint
app.get('/api/smm/balance', async (req, res) => {
  try {
    const result = await callOgaviral('balance', {});
    res.json({ status: true, data: result });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
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

// Gift Card Endpoints
app.post('/api/giftcards/generate', async (req, res) => {
  const { amount, userId } = req.body;
  if (!amount || !userId) return res.status(400).json({ status: false, message: 'Amount and User ID required' });
  
  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(404).json({ status: false, message: 'User not found' });
    if ((userDoc.data()?.walletBalance || 0) < amount) return res.status(400).json({ status: false, message: 'Insufficient balance' });
    
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    await db.runTransaction(async (transaction) => {
      transaction.update(userRef, { walletBalance: admin.firestore.FieldValue.increment(-amount) });
      transaction.set(db.collection('giftcards').doc(code), {
        code,
        amount: Number(amount),
        creatorId: userId,
        status: 'ACTIVE',
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
      transaction.set(db.collection('transactions').doc(), {
        userId,
        userEmail: userDoc.data()?.email,
        type: 'DEBIT',
        amount,
        source: 'Gift Card Generation',
        remarks: `Generated Gift Card: ${code}`,
        status: 'SUCCESS',
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    res.json({ status: true, message: 'Gift card generated successfully', code });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

app.post('/api/giftcards/redeem', async (req, res) => {
  const { code, userId } = req.body;
  if (!code || !userId) return res.status(400).json({ status: false, message: 'Code and User ID required' });
  
  try {
    const db = admin.firestore();
    const giftcardRef = db.collection('giftcards').doc(code.toUpperCase());
    const giftcardDoc = await giftcardRef.get();
    
    if (!giftcardDoc.exists || giftcardDoc.data()?.status !== 'ACTIVE') {
      return res.status(400).json({ status: false, message: 'Invalid or already redeemed gift card' });
    }
    
    const amount = giftcardDoc.data()?.amount;
    const fee = amount * 0.005; // 0.5% charge
    const redeemAmount = amount - fee;
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(404).json({ status: false, message: 'User not found' });
    
    await db.runTransaction(async (transaction) => {
      transaction.update(giftcardRef, { status: 'REDEEMED', redeemerId: userId, date_redeemed: admin.firestore.FieldValue.serverTimestamp() });
      transaction.update(userRef, { walletBalance: admin.firestore.FieldValue.increment(redeemAmount) });
      transaction.set(db.collection('transactions').doc(), {
        userId,
        userEmail: userDoc.data()?.email,
        type: 'CREDIT',
        amount: redeemAmount,
        source: 'Gift Card Redemption',
        remarks: `Redeemed Gift Card: ${code} (Fee: N${fee})`,
        status: 'SUCCESS',
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    res.json({ status: true, message: `Gift card redeemed! N${redeemAmount.toLocaleString()} added to your wallet.` });
  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Billstack Webhook
app.post('/api/billstack-webhook', async (req, res) => {
  const secret = process.env.BILLSTACK_SECRET_KEY;
  const md5Secret = process.env.BILLSTACK_MD5_SECRET;
  
  if (!secret) return res.status(500).json({ message: 'Billstack secret not configured' });
  
  const expectedSignature = md5Secret || crypto.createHash('md5').update(secret).digest('hex');
  if (req.headers['x-wiaxy-signature'] !== expectedSignature) {
    console.warn('Billstack Webhook: Invalid signature');
    return res.status(401).json({ message: 'Invalid signature' });
  }

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
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${CRA_PORT}`,
    changeOrigin: true,
    ws: true // support websockets for HMR
  }));
} else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Serve static files from the React build folder
  const buildPath = path.join(process.cwd(), 'build');
  app.use(express.static(buildPath));
  
  // Handle SPA routing: serve index.html for any non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
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
    if (!process.env.VERCEL) {
      setInterval(processScheduledTransactions, 60000);
    } else {
      console.log('Scheduler disabled in Vercel serverless environment. Use Vercel Cron instead.');
    }
  } catch (error: any) {
    console.error('Failed to connect to Firestore. Scheduler will not run:', error.message);
  }
};

startScheduler();

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
