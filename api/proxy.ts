import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method: targetMethod = 'GET', data, server = 'server2' } = payload || {};

  console.log(`[Proxy] Connecting to ${server} @ ${targetMethod} ${endpoint}`);

  const providers = {
    server1: {
      baseUrl: 'https://inlomax.com/api',
      apiKey: process.env.INLOMAX_API_KEY,
      authHeader: (key: string) => ({ 'Authorization': `Token ${key}` })
    },
    server2: {
      baseUrl: process.env.CIP_API_BASE_URL || 'https://api.ciptopup.ng/api',
      apiKey: process.env.CIP_API_KEY,
      authHeader: (key: string) => ({ 'x-api-key': key })
    }
  };

  const selectedProvider = providers[server as keyof typeof providers] || providers.server2;

  if (!selectedProvider.apiKey) {
    console.error(`[Proxy Error] Missing API Key for ${server}`);
    return res.status(500).json({ status: 'error', message: `Server ${server} is not configured in environment.` });
  }

  try {
    const cleanBaseUrl = selectedProvider.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    const fullUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...selectedProvider.authHeader(selectedProvider.apiKey)
    };

    const fetchOptions: any = {
      method: targetMethod,
      headers,
    };

    if (targetMethod !== 'GET' && data) {
      const requestData = { ...data };
      if (server === 'server1') {
        // Map fields for Server 1 if necessary, but keep requestData clean
        if (requestData.phone_number) requestData.mobileNumber = requestData.phone_number;
        if (requestData.phone) requestData.mobileNumber = requestData.phone;
        if (requestData.plan_id) requestData.serviceID = requestData.plan_id;
        
        // Remove internal-only fields
        delete requestData.server;
        delete requestData.plan_name;
        delete requestData.network;
        delete requestData.phone_number;
        delete requestData.phone;
        delete requestData.plan_id;
        delete requestData.amount; 
      }
      fetchOptions.body = JSON.stringify(requestData);
    }

    // Set a fetch timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    console.log(`[Proxy] ${server} responded with status: ${apiResponse.status}`);

    try {
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch {
      // If not JSON, it might be a text error from the server (e.g. 404 HTML)
      console.error(`[Proxy Error] ${server} returned non-JSON: ${responseText.substring(0, 100)}`);
      return res.status(apiResponse.status).send(responseText);
    }
  } catch (error: any) {
    console.error(`[Proxy Fatal] Connection failed:`, error.message);
    return res.status(504).json({ status: 'error', message: 'The gateway connection timed out.', detail: error.message });
  }
}