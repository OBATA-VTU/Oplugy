
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action, category, serviceId } = req.query;

  try {
    switch (action) {
      case 'categories':
        return await getCategories(res);
      case 'services':
        return await getServices(res, String(category));
      case 'purchase':
        return await executePurchase(req, res);
      default:
        return res.status(400).json({ status: false, message: 'Invalid action' });
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

async function getCategories(res: VercelResponse) {
  const apiKey = process.env.SMM_API_KEY;
  const baseUrl = 'https://smm-provider.com/api/v2'; // Replace with actual SMM provider URL if needed

  const response = await axios.post(baseUrl, {
    key: apiKey,
    action: 'services'
  });

  const services = response.data || [];
  const categories = Array.from(new Set(services.map((s: any) => s.category)));
  return res.status(200).json({ status: true, data: categories });
}

async function getServices(res: VercelResponse, category: string) {
  const apiKey = process.env.SMM_API_KEY;
  const baseUrl = 'https://smm-provider.com/api/v2';

  const response = await axios.post(baseUrl, {
    key: apiKey,
    action: 'services'
  });

  const services = response.data || [];
  const filtered = services.filter((s: any) => s.category === category);
  return res.status(200).json({ status: true, data: filtered });
}

async function executePurchase(req: VercelRequest, res: VercelResponse) {
  // Logic for SMM purchase
  return res.status(200).json({ status: true, message: 'SMM Purchase logic here' });
}
