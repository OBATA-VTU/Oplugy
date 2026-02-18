
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  if (!CIP_API_KEY) {
    return res.status(500).json({ status: 'error', message: 'Infrastructure credentials missing.' });
  }

  try {
    const payload = req.method === 'POST' ? req.body : req.query;
    const { endpoint, method: targetMethod = 'GET', data } = payload || {};

    if (!endpoint) {
      return res.status(200).json({ status: 'success', message: 'OBATA v2 infrastructure is operational.' });
    }

    const cleanBaseUrl = CIP_API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const fetchOptions: any = {
      method: targetMethod,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': CIP_API_KEY,
      },
      signal: controller.signal
    };

    if (targetMethod !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);

    const responseText = await apiResponse.text();

    try {
      if (!responseText) {
        return res.status(apiResponse.status).json({ status: 'error', message: 'Infrastructure returned empty data.' });
      }
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch {
      return res.status(apiResponse.status).send(responseText);
    }

  } catch (error: any) {
    console.error('[PROXY_ERROR]', error);
    return res.status(504).json({
      status: 'error',
      message: 'The node gateway timed out. Please try again.',
      detail: error.message
    });
  }
}
