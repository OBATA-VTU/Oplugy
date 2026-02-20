import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key, Authorization-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Server 2 (Integration Pending)
  return res.status(503).json({ 
    status: 'error', 
    message: 'Server 2 Integration in Progress. Node currently offline.' 
  });
}
