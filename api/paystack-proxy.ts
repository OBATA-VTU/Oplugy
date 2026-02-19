import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ status: false, message: 'Paystack Secret Key not configured in server environment.' });
  }

  const { path, method = 'GET', data } = req.body || {};
  if (!path) return res.status(400).json({ status: false, message: 'Missing API path.' });

  try {
    const fullUrl = `https://api.paystack.co/${path.replace(/^\//, '')}`;
    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    };

    const options: any = {
      method: method.toUpperCase(),
      headers
    };

    if (method.toUpperCase() !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);
    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}