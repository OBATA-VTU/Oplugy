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
    } else {
      admin.initializeApp();
    }
  } catch (e) {
    console.error('Error initializing Firebase Admin in Auth API:', e);
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const action = Array.isArray(path) ? path[0] : path;

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'signup':
        return await handleSignup(req, res);
      case 'me':
        return await handleMe(req, res);
      default:
        return res.status(404).json({ status: false, message: 'Auth action not found.' });
    }
  } catch (error: any) {
    console.error(`Auth API error (${action}):`, error);
    return res.status(500).json({ status: false, message: error.message || 'Internal server error.' });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  // Note: Firebase Auth is usually handled on the client, 
  // but if we have a custom login logic, it goes here.
  // For now, let's assume we just need to verify the user exists in Firestore.
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) {
    return res.status(404).json({ status: false, message: 'User not found.' });
  }
  const userData = snapshot.docs[0].data();
  return res.status(200).json({ status: true, data: { id: snapshot.docs[0].id, ...userData } });
}

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const userData = req.body;
  
  // Check if user already exists
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
}

async function handleMe(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      // If user exists in Auth but not in Firestore, create them
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
}
