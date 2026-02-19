import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method: targetMethod = 'GET', data, server = 'server2' } = payload || {};

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
    return res.status(500).json({ status: 'error', message: `System Error: ${server} API key not configured.` });
  }

  try {
    let cleanEndpoint = endpoint.replace(/^\//, '');
    
    // Inlomax (Server 1) often requires trailing slashes for directory-style endpoints
    if (server === 'server1' && !cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('?')) {
      cleanEndpoint += '/';
    }

    const fullUrl = `${selectedProvider.baseUrl.replace(/\/$/, '')}/${cleanEndpoint}`;
    
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
      let requestData = { ...data };
      if (server === 'server1') {
        const mappedData: any = {};
        if (requestData.serviceID) mappedData.serviceID = String(requestData.serviceID);
        else if (requestData.plan_id) mappedData.serviceID = String(requestData.plan_id);
        
        if (requestData.mobileNumber) mappedData.mobileNumber = String(requestData.mobileNumber);
        else if (requestData.phone_number) mappedData.mobileNumber = String(requestData.phone_number);
        else if (requestData.phone) mappedData.mobileNumber = String(requestData.phone);

        if (requestData.amount) mappedData.amount = Number(requestData.amount);
        requestData = mappedData;
      }
      fetchOptions.body = JSON.stringify(requestData);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout for upstream
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).send(responseText);
    }
  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Gateway timeout or connection refused.' });
  }
}