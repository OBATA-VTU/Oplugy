
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  // Diagnostic Log: Verify the key exists and its first few characters in Vercel Logs
  if (!CIP_API_KEY) {
    console.error('[PROXY_LOG] CRITICAL: CIP_API_KEY environment variable is MISSING in Vercel settings.');
  } else {
    console.log(`[PROXY_LOG] API Key Check: Key is present. Starts with: ${CIP_API_KEY.substring(0, 4)}...`);
  }

  // Health check
  if (req.method === 'GET' && !req.query.endpoint && !req.body?.endpoint) {
    return res.status(200).json({ status: 'success', message: 'Oplug Proxy is active and listening.' });
  }

  try {
    // Standardize input from body or query
    const payload = req.method === 'POST' ? req.body : req.query;
    const { endpoint, method: targetMethod = 'GET', data } = payload || {};

    if (!endpoint) {
      return res.status(400).json({ status: 'error', message: 'Missing endpoint parameter' });
    }

    if (!CIP_API_KEY) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Server Configuration Error: CIP_API_KEY is not set on Vercel.',
        tip: 'Go to Vercel Dashboard > Project Settings > Environment Variables and add CIP_API_KEY'
      });
    }

    const fullUrl = `${CIP_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    console.log(`[PROXY_LOG] Forwarding ${targetMethod} to: ${fullUrl}`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': CIP_API_KEY,
    };

    const fetchOptions: any = {
      method: targetMethod,
      headers: headers,
    };

    if (targetMethod !== 'GET' && targetMethod !== 'HEAD' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    const apiResponse = await fetch(fullUrl, fetchOptions);
    const responseText = await apiResponse.text();

    console.log(`[PROXY_LOG] Provider Status: ${apiResponse.status}`);

    // If 401, the key is definitely wrong
    if (apiResponse.status === 401) {
      console.error(`[PROXY_LOG] 401 ERROR: The provider rejected the API Key: ${CIP_API_KEY.substring(0, 4)}...`);
    }

    try {
      if (!responseText) {
        return res.status(apiResponse.status).json({ status: 'success', message: 'No content from provider' });
      }
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch (parseError) {
      console.error(`[PROXY_LOG] Failed to parse provider response. Raw: ${responseText.substring(0, 200)}`);
      return res.status(502).json({
        status: 'error',
        message: 'Invalid response format from provider.',
        raw: responseText.substring(0, 100)
      });
    }

  } catch (error: any) {
    console.error('[PROXY_LOG] Fatal Proxy Exception:', error);
    return res.status(500).json({
      status: 'error',
      message: 'A proxy error occurred.',
      error: error.message
    });
  }
}
