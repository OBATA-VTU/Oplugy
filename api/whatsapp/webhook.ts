// /api/whatsapp/webhook.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'oplug_vtu_bot_2024';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return res.status(200).send(challenge);
    } else {
      console.error('Webhook verification failed', { received: token });
      return res.status(403).send('Verification failed');
    }
  }

  if (req.method === 'POST') {
    // For now, just return 200 OK
    console.log('Webhook POST received', req.body);
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}