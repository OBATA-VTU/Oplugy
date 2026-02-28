import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (e) {
    console.error('Firebase Admin Init Error:', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secret = process.env.CIPTOPUP_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] || req.headers['authorization'];

  // Basic validation if secret is provided
  if (secret && receivedSecret !== secret) {
    console.warn('Invalid webhook secret received');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = req.body;
  console.log('Ciptopup Webhook Payload:', payload);

  // Ciptopup typical payload: { status: 'success', request_id: '...', amount: '...', phone: '...', plan: '...' }
  // Note: Adjust based on actual Ciptopup webhook structure
  const { status, request_id, reference, amount, mobile_number } = payload;

  if (status === 'success' || status === 'completed') {
    try {
      const db = admin.firestore();
      
      // Find transaction by reference or request_id
      const txRef = reference || request_id;
      if (txRef) {
        const txQuery = await db.collection('transactions')
          .where('reference', '==', txRef)
          .limit(1)
          .get();

        if (!txQuery.empty) {
          const txDoc = txQuery.docs[0];
          if (txDoc.data().status === 'PENDING') {
            await txDoc.ref.update({
              status: 'SUCCESS',
              date_updated: admin.firestore.FieldValue.serverTimestamp(),
              webhook_log: payload
            });
            console.log(`Transaction ${txRef} updated to SUCCESS via webhook`);
          }
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  return res.status(200).json({ status: 'received' });
}
