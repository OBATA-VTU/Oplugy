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
    console.error('Error initializing Firebase Admin in Paystack Webhook:', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ message: 'Paystack secret not configured' });
  }

  // Verify Paystack Signature
  const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;
  console.log('Paystack Webhook Event:', event.event);

  if (event.event === 'charge.success') {
    const data = event.data;
    const amount = data.amount / 100; // convert from kobo
    const email = data.customer.email;
    const metadata = data.metadata || {};
    const reference = data.reference;

    try {
      const db = admin.firestore();
      
      // 1. Find user by email or phone (from metadata)
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
        // 2. Update user balance
        await userRef.update({
          walletBalance: admin.firestore.FieldValue.increment(amount)
        });

        // 3. Record transaction
        await db.collection('transactions').add({
          userId: userRef.id,
          userEmail: email,
          type: 'CREDIT',
          amount: amount,
          source: 'Paystack (WhatsApp Bot)',
          status: 'SUCCESS',
          reference: reference,
          date_created: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Successfully funded user ${userRef.id} with ₦${amount}`);
      } else {
        console.warn(`User not found for email ${email} or phone ${metadata.phone}`);
      }
    } catch (error) {
      console.error('Error processing Paystack webhook:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(200).json({ status: 'received' });
}
