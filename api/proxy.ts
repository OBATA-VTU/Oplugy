
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Log incoming request details for Vercel logs
  console.log(`[PROXY_REQUEST] Method: ${req.method}, Body:`, req.body);

  // Allow both GET and POST for better compatibility and testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed`,
      data: null,
      errors: [{ path: 'method', message: 'Only GET and POST requests are accepted.', code: 'method_not_allowed' }]
    });
  }

  // Handle a simple health check if no endpoint is provided
  if (req.method === 'GET' && (!req.body || !req.body.endpoint)) {
    return res.status(200).json({
      status: 'success',
      message: 'Proxy is alive and healthy.',
      timestamp: new Date().toISOString()
    });
  }

  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  if (!CIP_API_KEY) {
    console.error('[PROXY_ERROR] CIP_API_KEY environment variable is missing.');
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error: API key is missing.',
      data: null,
      errors: [{ path: 'server', message: 'API key not configured in environment.', code: 'config_error' }]
    });
  }

  try {
    const { endpoint, method, data } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameter: `endpoint`.',
        data: null
      });
    }
    
    const targetMethod = method || 'GET';
    const fullUrl = `${CIP_API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    console.log(`[PROXY_FORWARD] Forwarding ${targetMethod} to ${fullUrl}`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': CIP_API_KEY,
    };

    const config: RequestInit = {
      method: targetMethod,
      headers: headers,
      body: targetMethod !== 'GET' && data ? JSON.stringify(data) : undefined,
    };

    const apiResponse = await fetch(fullUrl, config);
    const responseText = await apiResponse.text();

    if (!responseText) {
        return res.status(apiResponse.status).json({
             status: apiResponse.ok ? 'success' : 'error',
             message: 'Provider returned an empty response.',
             data: null
        });
    }

    try {
        const responseData = JSON.parse(responseText);
        return res.status(apiResponse.status).json(responseData);
    } catch (jsonError) {
        console.error(`[PROXY_JSON_ERROR] Status: ${apiResponse.status}, URL: ${fullUrl}, Body: ${responseText}`);
        return res.status(502).json({
            status: 'error',
            message: 'Provider returned an invalid response format.',
            data: null,
            raw: responseText.substring(0, 200) // Include snippet for debugging
        });
    }

  } catch (error: any) {
    console.error('[PROXY_FATAL_ERROR]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Proxy error occurred while contacting the provider.',
      errors: [{ message: error.message || 'Unknown network error' }]
    });
  }
}
