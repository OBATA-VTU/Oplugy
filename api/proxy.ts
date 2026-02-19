import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method: targetMethod = 'GET', data, server = 'server2' } = payload || {};

  console.log(`[Proxy] Routing ${targetMethod} ${endpoint} to ${server}`);

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
    console.error(`[Proxy Error] Missing credentials for ${server}. Ensure ${server === 'server1' ? 'INLOMAX_API_KEY' : 'CIP_API_KEY'} is set.`);
    return res.status(500).json({ status: 'error', message: `System Error: ${server} credentials not found.` });
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
        // Documentation mapping for Inlomax field names
        if (requestData.phone_number) requestData.mobileNumber = requestData.phone_number;
        if (requestData.phone) requestData.mobileNumber = requestData.phone;
        if (requestData.plan_id) requestData.serviceID = requestData.plan_id;
        
        // Remove UI-only helper fields before sending to provider
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    console.log(`[Proxy] ${server} responded with status ${apiResponse.status}`);

    try {
      const responseData = JSON.parse(responseText);
      return res.status(apiResponse.status).json(responseData);
    } catch {
      console.error(`[Proxy Error] ${server} returned non-JSON response.`);
      return res.status(apiResponse.status).send(responseText);
    }
  } catch (error: any) {
    console.error(`[Proxy Fatal] Connection to ${server} failed:`, error.message);
    return res.status(504).json({ status: 'error', message: 'The gateway connection timed out.', detail: error.message });
  }
}