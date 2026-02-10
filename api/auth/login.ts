
// Added explicit import for Buffer to resolve 'Cannot find name Buffer' TypeScript error.
import { Buffer } from 'buffer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // For this stage, we use a controlled "Demo" account. 
  // In the next stage, we will connect this to a real database (PostgreSQL/MongoDB).
  const VALID_EMAIL = 'user@oplug.com';
  const VALID_PASSWORD = 'P@ssword123!';

  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token: `sk_live_${Buffer.from(email).toString('base64')}_${Date.now()}`,
        user: {
          id: 'u_782341',
          email: email,
          fullName: 'Oplug Premium User',
          walletBalance: 75250.50, // Real balance would come from DB
          role: 'user'
        }
      }
    });
  }

  return res.status(401).json({
    status: 'error',
    message: 'Invalid email or password. Please check your credentials.'
  });
}
