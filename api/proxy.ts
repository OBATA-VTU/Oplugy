
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers to allow requests from the frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`[PROXY_LOG] Incoming ${req.method} request to ${req.url}`);

  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  if (!CIP_API_KEY) {
    console.error('[PROXY_LOG] ERROR: CIP_API_KEY is not configured.');
    return res.status(500).json({
      status: 'error',
      message: 'Server Configuration Error: API Key missing.',
      errors: [{ message: 'The CIP_API_KEY environment variable is not set on Vercel.' }]
    });
  }

  // Support health checks
  if (req.method === 'GET' && (!req.query || !req.query.endpoint) && (!req.body || !req.body.endpoint)) {
    return res.status(200).json({ status: 'success', message: 'Proxy is active.' });
  }

  try {
    // Get parameters from body (POST) or query string (GET)
    const payload = req.method === 'POST' ? req.body : req.query;
    const { endpoint, method: targetMethod = 'GET', data } = payload || {};

    if (!endpoint) {
      return res.status(400).json({
        status: 'error',
        message: 'Bad Request: `endpoint` parameter is missing.',
        received: payload
      });
    }

    const fullUrl = `${CIP_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    console.log(`[PROXY_LOG] Forwarding ${targetMethod} to: ${fullUrl}`);

    const fetchOptions: RequestInit = {
      method: targetMethod,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': CIP_API_KEY,
      },
      body: targetMethod !== 'GET' && targetMethod !== 'HEAD' && data ? JSON.stringify(data) : undefined,
    };

    const apiResponse = await fetch(fullUrl, fetchOptions);
    const responseText = await apiResponse.text();

    console.log(`[PROXY_LOG] Provider responded with status: ${apiResponse.status}`);

    if (!responseText) {
      return res.status(apiResponse.status).json({
        status: apiResponse.ok ? 'success' : 'error',
        message: 'Empty response from provider',
        data: null
      });
    }

    try {
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch (e) {
      console.error(`[PROXY_LOG] JSON Parse Error. Raw: ${responseText.substring(0, 100)}`);
      return res.status(502).json({
        status: 'error',
        message: 'Provider returned non-JSON response.',
        raw: responseText.substring(0, 200)
      });
    }

  } catch (error: any) {
    console.error('[PROXY_LOG] Fatal Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Proxy Error',
      errors: [{ message: error.message || 'Unknown error' }]
    });
  }
}
