
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
    console.error('Error initializing Firebase Admin in VTU Info API:', e);
  }
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action, server = 1, network, type } = req.query;

  try {
    switch (action) {
      case 'networks':
        return await getNetworks(res, Number(server));
      case 'plans':
        return await getPlans(res, Number(server), String(network), String(type || ''));
      case 'providers':
        return await getProviders(res, String(type));
      default:
        return res.status(400).json({ status: false, message: 'Invalid action' });
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

async function getNetworks(res: VercelResponse, server: number) {
  if (server === 1) {
    const apiKey = process.env.INLOMAX_API_KEY;
    const response = await axios.get('https://inlomax.com/api/services', {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    const plans = response.data.dataPlans || [];
    const networks = Array.from(new Set(plans.map((p: any) => p.network))).filter(n => !!n);
    return res.status(200).json({ status: true, data: networks });
  } else {
    const apiKey = process.env.CIPTOPUP_API_KEY;
    const response = await axios.get('https://ciptopup.com/api/v1/data/plans', {
      headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${apiKey}` }
    });
    const plans = response.data.data || [];
    const networks = Array.from(new Set(plans.map((p: any) => p.network || p.operator))).filter(n => !!n);
    return res.status(200).json({ status: true, data: networks });
  }
}

async function getPlans(res: VercelResponse, server: number, network: string, type: string) {
  if (server === 1) {
    const apiKey = process.env.INLOMAX_API_KEY;
    const response = await axios.get('https://inlomax.com/api/services', {
      headers: { 'Authorization': `Token ${apiKey}` }
    });
    const allPlans = response.data.dataPlans || [];
    const filtered = allPlans.filter((p: any) => 
      p.network && p.network.toUpperCase() === network.toUpperCase() &&
      (!type || (p.dataType && p.dataType.toUpperCase() === type.toUpperCase()))
    );
    return res.status(200).json({ status: true, data: filtered });
  } else {
    const apiKey = process.env.CIPTOPUP_API_KEY;
    const response = await axios.get(`https://ciptopup.com/api/v1/data/plans?network=${network}`, {
      headers: { 'x-api-key': apiKey, 'Authorization': `Bearer ${apiKey}` }
    });
    const allPlans = response.data.data || [];
    const filtered = allPlans.filter((p: any) => 
      (!type || (p.type && p.type.toUpperCase() === type.toUpperCase()))
    );
    return res.status(200).json({ status: true, data: filtered });
  }
}

async function getProviders(res: VercelResponse, type: string) {
  const pricingSnap = await db.collection('manual_pricing').get();
  const manualPricing = pricingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  
  const filtered = manualPricing.filter((p: any) => p.planId && p.planId.includes(type.toUpperCase()));
  const providers = Array.from(new Set(filtered.map((p: any) => p.planId.split('-')[1])));
  return res.status(200).json({ status: true, data: providers });
}
