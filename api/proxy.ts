// This is a Vercel serverless function located at /api/proxy.ts
// It proxies requests from the frontend to the CIP API to bypass CORS issues
// and provides robust server-side logging that is guaranteed to show up in Vercel logs.

/**
 * Handles incoming requests and forwards them to the CIP API.
 * @param {import('http').IncomingMessage & { body: any }} req - The incoming request object from the client.
 * @param {import('http').ServerResponse} res - The server response object to send back to the client.
 */
export default async function handler(req, res) {
  // --- Configuration ---
  const CIP_API_BASE_URL = 'https://api-service.cyberbeats.io/v1';
  // IMPORTANT: This key should be in Vercel Environment Variables, not hardcoded.
  const CIP_API_KEY = 'd705f8cecb7221e4b6d758c9ca2ff919'; 

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

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': CIP_API_KEY,
    };

    const config = {
      method: method || (data ? 'POST' : 'GET'),
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const apiResponse = await fetch(fullUrl, config);

    // --- Logging the response from the external API ---
    const responseStatus = apiResponse.status;
    console.log(`[OPLUG_PROXY_LOG] Received response from CIP API for ${endpoint}. Status: ${responseStatus}`);

    const responseBody = await apiResponse.json();

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
}
