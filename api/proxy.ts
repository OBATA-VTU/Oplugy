
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Security: Only allow POST requests to this proxy
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed`,
      data: null,
      errors: [{ path: 'method', message: 'Only POST requests are accepted.', code: 'method_not_allowed' }]
    });
  }

  // 2. Get API credentials from environment variables
  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  if (!CIP_API_KEY) {
    console.error('[PROXY_ERROR] CIP_API_KEY is not set in environment variables.');
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error: API key is missing.',
      data: null,
      errors: [{ path: 'server', message: 'The API key for the payment provider is not configured.', code: 'config_error' }]
    });
  }

  try {
    // 3. Destructure payload from the frontend client
    const { endpoint, method, data } = req.body;

    if (!endpoint || !method) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request to proxy: `endpoint` and `method` are required.',
        data: null,
        errors: [{ path: 'proxy', message: 'Missing required proxy parameters.', code: 'bad_request' }]
      });
    }
    
    const fullUrl = `${CIP_API_BASE_URL}/${endpoint}`;
    console.log(`[PROXY_INFO] Forwarding request: ${method} ${fullUrl}`);

    // 4. Construct the request to the external CIP API
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': CIP_API_KEY,
    };

    const config: RequestInit = {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    // 5. Make the actual API call
    const apiResponse = await fetch(fullUrl, config);

    // 6. NEW ROBUST RESPONSE HANDLING
    // First, get the raw text of the response. This is safe even if empty.
    const responseText = await apiResponse.text();

    // Handle cases where the provider returns an empty body.
    if (!responseText) {
        console.warn(`[PROXY_WARN] Received empty response body from ${fullUrl} with status ${apiResponse.status}.`);
        // If the status code was in the 2xx range, treat as success, otherwise error.
        const responseStatus = apiResponse.ok ? 'success' : 'error';
        return res.status(apiResponse.status).json({
             status: responseStatus,
             message: 'Received an empty response from the provider.',
             data: null,
             errors: apiResponse.ok ? null : [{ path: 'provider', message: `Provider returned status ${apiResponse.status} with an empty body.`, code: 'empty_response' }]
        });
    }

    // Now that we know the body is not empty, try to parse it as JSON.
    try {
        const responseData = JSON.parse(responseText);
        console.log(`[PROXY_SUCCESS] Received response from ${fullUrl} with status ${apiResponse.status}`);
        // Forward the original status and the parsed JSON data.
        res.status(apiResponse.status).json(responseData);
    } catch (jsonError) {
        // This catch block now only runs if the response was not empty but was *still* invalid JSON.
        console.error(
            `[PROXY_ERROR] Failed to parse JSON from CIP API. Status: ${apiResponse.status}. URL: ${fullUrl}. \nResponse Text: "${responseText}"`
        );
        res.status(502).json({
            status: 'error',
            message: 'Received an invalid or non-JSON response from the payment provider.',
            data: null,
            errors: [{ path: 'provider', message: `The provider returned status ${apiResponse.status}, but the response was not valid JSON.`, code: 'invalid_json' }]
        });
    }

  } catch (error: any) {
    console.error('[PROXY_FATAL] A network-level error occurred while calling the CIP API:', error);
    res.status(500).json({
      status: 'error',
      message: 'A server error occurred while contacting the payment provider.',
      data: null,
      errors: [{ path: 'network', message: error.message || 'Unknown fetch error', code: 'network_error' }],
    });
  }
}
