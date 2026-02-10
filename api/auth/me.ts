
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No session token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // In a real app, we would verify the JWT here.
    // For now, we simulate success if the token looks like our mock token.
    if (token.startsWith('sk_live_')) {
      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: 'u_782341',
            email: 'user@oplug.com',
            fullName: 'Oplug Premium User',
            walletBalance: 75250.50,
            role: 'user'
          }
        }
      });
    }

    return res.status(401).json({ status: 'error', message: 'Session expired. Please login again.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
}
