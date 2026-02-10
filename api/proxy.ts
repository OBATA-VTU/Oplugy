
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Set CORS headers for security and browser compatibility
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization'
  );

  // Handle browser preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Configuration: Defaulting to PRODUCTION as per request
  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  console.log(`[PROXY_LOG] Incoming ${req.method} request to ${req.url}`);
  
  // Safety check for API Key
  if (!CIP_API_KEY) {
    console.error('[PROXY_LOG] CRITICAL: CIP_API_KEY is not defined in Vercel Environment Variables.');
    return res.status(500).json({
      status: 'error',
      message: 'Server Configuration Error: API key is missing.',
      tip: 'Ensure CIP_API_KEY is added to your Vercel Project Settings > Environment Variables.'
    });
  }

  // Log the first 4 characters of the key for debugging
  console.log(`[PROXY_LOG] Auth Check: Key starts with "${CIP_API_KEY.substring(0, 4)}..."`);

  // Simple status check endpoint
  if (req.method === 'GET' && !req.query.endpoint && (!req.body || !req.body.endpoint)) {
    const isProd = !CIP_API_BASE_URL.includes('dev-api');
    return res.status(200).json({ 
      status: 'success', 
      message: 'Oplug Gateway is active.',
      mode: isProd ? 'LIVE PRODUCTION' : 'SANDBOX/DEVELOPMENT',
      endpoint: CIP_API_BASE_URL
    });
  }

  try {
    // Extract payload from POST body or GET query
    const payload = req.method === 'POST' ? req.body : req.query;
    const { endpoint, method: targetMethod = 'GET', data } = payload || {};

    if (!endpoint) {
      return res.status(400).json({
        status: 'error',
        message: 'Bad Request: The "endpoint" parameter is required.'
      });
    }

    // Build the final target URL
    const cleanBaseUrl = CIP_API_BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
    
    console.log(`[PROXY_LOG] [${!CIP_API_BASE_URL.includes('dev-api') ? 'LIVE' : 'DEV'}] Forwarding ${targetMethod} to: ${fullUrl}`);

    // Standard headers for CIP Topup API
    const fetchOptions: any = {
      method: targetMethod,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': CIP_API_KEY,
      },
    };

    // Attach body for non-GET requests
    if (targetMethod !== 'GET' && targetMethod !== 'HEAD' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    const apiResponse = await fetch(fullUrl, fetchOptions);
    const responseText = await apiResponse.text();

    console.log(`[PROXY_LOG] Provider Response Status: ${apiResponse.status}`);

    // Special handling for 401 Unauthorized (Invalid API Key)
    if (apiResponse.status === 401) {
      console.error(`[PROXY_LOG] AUTHENTICATION FAILED: The provider rejected the key on ${CIP_API_BASE_URL}`);
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed. Please verify your Live API Key is correct in Vercel.',
        provider_response: responseText ? (responseText.startsWith('{') ? JSON.parse(responseText) : responseText) : null
      });
    }

    // Try to parse as JSON, fallback to raw text if necessary
    try {
      if (!responseText) {
        return res.status(apiResponse.status).json({ 
          status: apiResponse.ok ? 'success' : 'error', 
          message: 'Provider returned an empty response.' 
        });
      }
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch (parseError) {
      console.warn(`[PROXY_LOG] Provider returned non-JSON content. Status: ${apiResponse.status}`);
      return res.status(apiResponse.status).send(responseText);
    }

  } catch (error: any) {
    console.error('[PROXY_LOG] FATAL ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal error occurred while communicating with the provider.',
      error_detail: error.message
    });
  }
}
