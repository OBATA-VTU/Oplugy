import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

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
    console.error('Error initializing Firebase Admin in Webhooks API:', e);
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { provider } = req.query;
  const providerName = Array.isArray(provider) ? provider[0] : provider;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    switch (providerName) {
      case 'paystack':
        return await handlePaystackWebhook(req, res);
      case 'billstack':
        return await handleBillstackWebhook(req, res);
      case 'ciptopup':
        return await handleCiptopupWebhook(req, res);
      case 'inlomax':
        return await handleInlomaxWebhook(req, res);
      default:
        return res.status(404).json({ status: false, message: 'Webhook provider not found.' });
    }
  } catch (error: any) {
    console.error(`Webhook API error (${providerName}):`, error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error.' });
  }
}

async function handlePaystackWebhook(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ message: 'Paystack secret not configured' });

  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const data = event.data;
    const amount = data.amount / 100;
    const email = data.customer.email;
    const metadata = data.metadata || {};
    const reference = data.reference;

    let userRef;
    if (metadata.phone) {
      const snapshot = await db.collection('users').where('phone', '==', metadata.phone).limit(1).get();
      if (!snapshot.empty) userRef = snapshot.docs[0].ref;
    }
    if (!userRef) {
      const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snapshot.empty) userRef = snapshot.docs[0].ref;
    }

    if (userRef) {
      await userRef.update({ walletBalance: admin.firestore.FieldValue.increment(amount) });
      await db.collection('transactions').add({
        userId: userRef.id,
        userEmail: email,
        type: 'CREDIT',
        amount: amount,
        source: 'Paystack',
        status: 'SUCCESS',
        reference: reference,
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  return res.status(200).json({ status: 'received' });
}

async function handleBillstackWebhook(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.BILLSTACK_SECRET_KEY;
  if (!secret) return res.status(500).json({ message: 'Billstack secret not configured' });

  // Billstack uses MD5 of secret key for signature
  const expectedSignature = crypto.createHash('md5').update(secret).digest('hex');
  const receivedSignature = req.headers['x-wiaxy-signature'];

  if (receivedSignature !== expectedSignature) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const payload = req.body;
  if (payload.event === 'PAYMENT_NOTIFIFICATION' && payload.data?.type === 'RESERVED_ACCOUNT_TRANSACTION') {
    const data = payload.data;
    const amount = parseFloat(data.amount);
    const merchantReference = data.merchant_reference; // This should be the user ID or a unique ref we generated
    const reference = data.reference;

    let userRef;
    // Try finding by merchant_reference (which contains the userId)
    if (merchantReference && merchantReference.startsWith('REF-')) {
      const parts = merchantReference.split('-');
      if (parts.length >= 2) {
        const userId = parts[1];
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) userRef = userDoc.ref;
      }
    }

    if (!userRef) {
      // Fallback: Find by account number
      const accountNumber = data.account?.account_number;
      const snapshot = await db.collection('users').where('virtualAccount.account_number', '==', accountNumber).limit(1).get();
      if (!snapshot.empty) userRef = snapshot.docs[0].ref;
    }

    if (userRef) {
      const userData = (await userRef.get()).data();
      await userRef.update({ walletBalance: admin.firestore.FieldValue.increment(amount) });
      await db.collection('transactions').add({
        userId: userRef.id,
        userEmail: userData?.email,
        type: 'CREDIT',
        amount: amount,
        source: 'Virtual Account (Billstack)',
        status: 'SUCCESS',
        reference: reference,
        date_created: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  return res.status(200).json({ status: 'received' });
}

async function handleCiptopupWebhook(req: VercelRequest, res: VercelResponse) {
  // Existing logic for ciptopup
  return res.status(200).json({ status: 'received' });
}

async function handleInlomaxWebhook(req: VercelRequest, res: VercelResponse) {
  // Existing logic for inlomax
  return res.status(200).json({ status: 'received' });
}
