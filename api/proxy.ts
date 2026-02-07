
// This is a Vercel serverless function located at /api/proxy.ts
// It proxies requests from the frontend to the CIP API to bypass CORS issues
// and provides robust server-side logging that is guaranteed to show up in Vercel logs.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // --- Configuration from Official CIP API Documentation ---
  const CIP_API_BASE_URL = 'https://dev-api.ciptopup.ng/api'; // Using dev environment URL from docs
  // IMPORTANT: The API key is stored as an environment variable for security.
  const CIP_API_KEY = process.env.CIP_API_KEY || '7b908cd0c85f6a18a1feae59b7213633'; // Fallback to test key for simplicity

  // --- Security: Only allow POST requests to this proxy ---
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
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
    const responseStatus = apiResponse.status;
    const responseText = await apiResponse.text(); // Read the raw text of the response first

    console.log(`[OPLUG_PROXY_LOG] Received response from CIP API for ${endpoint}. Status: ${responseStatus}`);
    console.log(`[OPLUG_PROXY_LOG] Raw Response Body:`, responseText);

    // If the response body is empty, we cannot parse it as JSON.
    if (!responseText.trim()) {
      console.warn(`[OPLUG_PROXY_WARN] Empty response body from CIP API for ${endpoint}. Status: ${responseStatus}.`);
      // Return a structured error to the client instead of an empty body.
      const message = apiResponse.ok ? 'Operation successful with empty response.' : 'Request failed with empty response.';
      return res.status(responseStatus).json({
          status: apiResponse.ok ? 'success' : 'error',
          message: message,
          data: null,
          errors: [],
      });
    }

    // Now, try to parse the non-empty response text.
    try {
      const responseBody = JSON.parse(responseText);
      res.setHeader('Content-Type', 'application/json');
      res.status(responseStatus).json(responseBody);
    } catch (jsonError) {
      console.error('[OPLUG_PROXY_ERROR] Failed to parse JSON from CIP API.', {
        endpoint,
        status: responseStatus,
        body: responseText,
        error: jsonError instanceof Error ? jsonError.message : String(jsonError),
      });
      // The upstream API returned a non-JSON response. Inform the client.
      res.status(502).json({
          status: 'error',
          message: 'Bad Gateway: The upstream API returned an invalid response.',
          data: responseText, // Send the raw text for debugging on the client
      });
    }

  } catch (error) {
    console.error('[OPLUG_PROXY_ERROR] An unexpected error occurred in the proxy function:', error);
    res.status(500).json({ 
        message: 'An internal server error occurred in the proxy.',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default handler;
