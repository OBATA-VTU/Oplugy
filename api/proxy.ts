
// This is a Vercel serverless function located at /api/proxy.ts
// It proxies requests from the frontend to the CIP API to bypass CORS issues
// and provides robust server-side logging that is guaranteed to show up in Vercel logs.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // --- VERBOSE LOGGING: Start of function execution ---
  console.log(`[PROXY_INIT] Function invoked. Method: ${req.method}. URL: ${req.url}`);
  console.log('[PROXY_INIT] Request Headers:', JSON.stringify(req.headers, null, 2));

  // --- Configuration ---
  const CIP_API_BASE_URL = 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY || '7b908cd0c85f6a18a1feae59b7213633';

  // --- Request Validation ---
  if (req.method !== 'POST') {
    console.warn(`[PROXY_WARN] Blocked non-POST request. Method: ${req.method}`);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed on this proxy.` });
  }

  // Vercel automatically parses the body for 'application/json' content-type.
  // If req.body is empty or not an object, parsing failed or the client sent an empty/invalid body.
  if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
    console.error('[PROXY_ERROR] Request body is missing, empty, or not a valid JSON object.');
    console.error('[PROXY_ERROR] Received Body:', req.body);
    return res.status(400).json({
      status: 'error',
      message: 'The server received an invalid request. A valid JSON body is required.',
      data: null,
      errors: [{ path: 'body', message: 'Request body is missing or malformed.' }],
    });
  }

  try {
    // --- Destructure and Log Payload ---
    const { endpoint, method, data } = req.body;
    console.log(`[PROXY_REQUEST] Processing request for endpoint: "${endpoint}" with method: "${method}"`);
    if(data) {
        console.log(`[PROXY_REQUEST] Payload data:`, JSON.stringify(data, null, 2));
    }

    if (!endpoint) {
      console.warn('[PROXY_WARN] Request rejected. Missing "endpoint" in payload.');
      return res.status(400).json({ status: 'error', message: '`endpoint` is required in the request body.' });
    }

    // --- Prepare and Send Upstream Request ---
    const fullUrl = `${CIP_API_BASE_URL}/${endpoint}`;
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-api-key': CIP_API_KEY };
    const config: RequestInit = {
      method: method || (data ? 'POST' : 'GET'),
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    console.log(`[PROXY_UPSTREAM] Sending request to CIP API: ${config.method} ${fullUrl}`);
    const apiResponse = await fetch(fullUrl, config);
    const responseStatus = apiResponse.status;
    const responseText = await apiResponse.text(); // Read as text first for safety

    console.log(`[PROXY_UPSTREAM] Received response from CIP API. Status: ${responseStatus}`);
    
    // Log the full text for debugging, especially for errors.
    if (!apiResponse.ok || responseText.length < 500) {
        console.log(`[PROXY_UPSTREAM] Raw Response Body:`, responseText);
    } else {
        console.log(`[PROXY_UPSTREAM] Received successful response body (length: ${responseText.length}).`);
    }

    // --- Process and Forward Response ---
    if (!responseText.trim()) {
      console.warn(`[PROXY_WARN] Empty response body from CIP API for endpoint: ${endpoint}.`);
      return res.status(responseStatus).json({
        status: apiResponse.ok ? 'success' : 'error',
        message: 'Operation completed, but the API returned no content.',
        data: null,
      });
    }

    try {
      const responseBody = JSON.parse(responseText);
      res.setHeader('Content-Type', 'application/json');
      return res.status(responseStatus).json(responseBody);
    } catch (jsonError) {
      console.error(`[PROXY_ERROR] Failed to parse JSON from CIP API for endpoint: ${endpoint}.`, jsonError);
      return res.status(502).json({
        status: 'error',
        message: 'Bad Gateway: The upstream API returned an invalid (non-JSON) response.',
        data: responseText, // Send raw text for client-side debugging
      });
    }

  } catch (error) {
    console.error('[PROXY_FATAL] An unexpected error occurred in the proxy function:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred in the proxy.',
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    });
  }
};

export default handler;
