
// This is a Vercel serverless function located at /api/proxy.ts
// It proxies requests from the frontend to the CIP API to bypass CORS issues
// and provides robust server-side logging that is guaranteed to show up in Vercel logs.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // --- Configuration from Official CIP API Documentation ---
  const CIP_API_BASE_URL = 'https://dev-api.ciptopup.ng/api'; // Using dev environment URL from docs
  // RESTORED: Using hardcoded test API key for debugging and testing as requested.
  const CIP_API_KEY = '7b908cd0c85f6a18a1feae59b7213633';

  // --- Security: Only allow POST requests to this proxy ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    // Vercel automatically parses JSON bodies for us.
    const { endpoint, method, data } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Error: `endpoint` is required in the request body.' });
    }
    
    const fullUrl = `${CIP_API_BASE_URL}/${endpoint}`;
    console.log(`[OPLUG_PROXY_LOG] Initiating ${method} request to: ${fullUrl}`);
    if (data) {
      console.log(`[OPLUG_PROXY_LOG] Request Body:`, JSON.stringify(data, null, 2));
    }


    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': CIP_API_KEY,
    };

    const config: RequestInit = {
      method: method || (data ? 'POST' : 'GET'),
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const apiResponse = await fetch(fullUrl, config);

    // --- Logging the response from the external API ---
    const responseStatus = apiResponse.status;
    const responseBody = await apiResponse.json(); // Read body once
    console.log(`[OPLUG_PROXY_LOG] Received response from CIP API for ${endpoint}. Status: ${responseStatus}`);
    console.log(`[OPLUG_PROXY_LOG] Response Body:`, JSON.stringify(responseBody, null, 2));


    // --- Forwarding headers, status code, and body ---
    res.setHeader('Content-Type', 'application/json');
    res.status(responseStatus).json(responseBody);

  } catch (error) {
    console.error('[OPLUG_PROXY_ERROR] An unexpected error occurred in the proxy function:', error);
    res.status(500).json({ 
        message: 'An internal server error occurred in the proxy.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Fix for: Cannot find name 'module'.
// Switched from CommonJS `module.exports` to standard ES Module `export default`.
// This is the correct way to export a handler in a TypeScript Vercel Function.
export default handler;
