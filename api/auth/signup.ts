
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
  }

  // Logic to save to database would go here.
  // For now, we return a success response to test the flow.
  return res.status(201).json({
    status: 'success',
    message: 'Account created successfully! You can now log in.',
    data: {
      user: {
        id: `u_${Math.random().toString(36).substr(2, 9)}`,
        email,
        fullName: fullName || 'New User',
        walletBalance: 0
      }
    }
  });
}
