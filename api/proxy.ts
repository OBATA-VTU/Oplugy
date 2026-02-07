
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Security: Only allow POST requests to this proxy
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      status: 'error',
      message: `Method ${req.method} Not Allowed`,
      data: null,
      errors: [{ message: 'Only POST requests are accepted.' }]
    });
  }

  // 2. Get API credentials from environment variables
  // Use the development URL as a fallback for easier local testing.
  const CIP_API_BASE_URL = process.env.CIP_API_BASE_URL || 'https://dev-api.ciptopup.ng/api';
  const CIP_API_KEY = process.env.CIP_API_KEY;

  if (!CIP_API_KEY) {
    console.error('[PROXY_ERROR] CIP_API_KEY is not set in environment variables.');
    return res.status(500).json({
      status: 'error',
      message: 'Server configuration error: API key is missing.',
      data: null,
      errors: [{ message: 'The API key for the payment provider is not configured on the server.' }]
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
        errors: [{ message: 'Missing required proxy parameters.' }]
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

    // 6. Handle the response from the CIP API
    const clonedResponse = apiResponse.clone();
    
    try {
        const responseData = await apiResponse.json();
        console.log(`[PROXY_SUCCESS] Received response from ${fullUrl} with status ${apiResponse.status}`);
        res.status(apiResponse.status).json(responseData);
    } catch (jsonError) {
        const responseText = await clonedResponse.text();
        console.error(
            `[PROXY_ERROR] Failed to parse JSON from CIP API. Status: ${apiResponse.status}. URL: ${fullUrl}. \nResponse Text: "${responseText}"`
        );
        res.status(502).json({
            status: 'error',
            message: 'Received an invalid or non-JSON response from the payment provider.',
            data: null,
            errors: [{ message: `The provider returned status ${apiResponse.status}, but the response was not valid JSON.` }]
        });
    }

  } catch (error: any) {
    console.error('[PROXY_FATAL] A network-level error occurred while calling the CIP API:', error);
    res.status(500).json({
      status: 'error',
      message: 'A server error occurred while contacting the payment provider.',
      data: null,
      errors: [{ message: error.message || 'Unknown fetch error' }],
    });
  }
}
