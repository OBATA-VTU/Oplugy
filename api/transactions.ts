
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // Returning empty array so users only see their actual transactions once integrated
  return res.status(200).json({
    status: 'success',
    data: []
  });
}
