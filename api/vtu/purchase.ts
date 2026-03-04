
import type { VercelRequest, VercelResponse } from '@vercel/node';
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
    }
  } catch (e) {
    console.error('Error initializing Firebase Admin in VTU API:', e);
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { userId, service, details } = req.body;

  if (!userId || !service || !details) {
    return res.status(400).json({ status: false, message: 'Missing required parameters.' });
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    if (userData.walletBalance < details.amount) {
      return res.status(400).json({ status: false, message: 'Insufficient wallet balance.' });
    }

    // Execute purchase via Inlomax (Server 1)
    const result = await executeInlomaxPurchase(service, details.payload);

    if (result.status) {
      // Deduct balance
      await userRef.update({
        walletBalance: admin.firestore.FieldValue.increment(-details.amount)
      });

      // Log transaction
      await db.collection('transactions').add({
        userId,
        userEmail: userData.email,
        type: service.toUpperCase(),
        amount: details.amount,
        source: `${details.network || 'VTU'} ${service} (Bot)`,
        status: 'SUCCESS',
        date_created: admin.firestore.FieldValue.serverTimestamp(),
        server: 'Inlomax'
      });

      return res.status(200).json({ status: true, message: 'Purchase successful', data: result.data });
    } else {
      return res.status(400).json({ status: false, message: result.message || 'Purchase failed' });
    }

  } catch (error: any) {
    console.error('VTU Purchase Error:', error.response?.data || error.message);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error' });
  }
}

async function executeInlomaxPurchase(service: string, payload: any) {
  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  // Map service names to Inlomax endpoints and payloads
  const endpointMap: any = {
    'data': 'paydata',
    'airtime': 'payairtime',
    'cable': 'subcable',
    'electricity': 'payelectric'
  };

  const endpoint = endpointMap[service] || service;
  let mappedPayload = { ...payload };

  // Inlomax specific mapping
  if (service === 'data') {
    mappedPayload = { serviceID: payload.plan || payload.serviceID, mobileNumber: payload.mobile_number || payload.mobileNumber };
  } else if (service === 'airtime') {
    mappedPayload = { network: payload.network, amount: payload.amount, mobileNumber: payload.mobile_number || payload.mobileNumber };
  }

  try {
    const response = await axios.post(`${baseUrl}/${endpoint}`, mappedPayload, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Authorization-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success' || response.data.status === true) {
      return { status: true, data: response.data };
    }
    return { status: false, message: response.data.message || 'Inlomax error' };
  } catch (error: any) {
    return { status: false, message: error.response?.data?.message || error.message };
  }
}
