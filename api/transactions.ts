import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // Mock transaction data
  const transactions = [
    {
      id: 'TXN_001',
      amount: 1500,
      status: 'SUCCESS',
      type: 'DATA',
      source: 'MTN SME',
      remarks: 'Purchased 2.5GB Data for 08123456789',
      date_created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      date_updated: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'TXN_002',
      amount: 500,
      status: 'SUCCESS',
      type: 'AIRTIME',
      source: 'AIRTEL',
      remarks: 'Purchased ₦500 Airtime for 08011122233',
      date_created: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      date_updated: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'TXN_003',
      amount: 5000,
      status: 'FAILED',
      type: 'ELECTRICITY',
      source: 'IKEDC',
      remarks: 'Electricity payment for meter 4501234567',
      date_created: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      date_updated: new Date(Date.now() - 259200000).toISOString(),
    }
  ];

  return res.status(200).json({
    status: 'success',
    data: transactions
  });
}