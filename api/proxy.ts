import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method: targetMethod = 'GET', data, server = 'server1' } = payload || {};

  const providers = {
    server1: {
      baseUrl: 'https://inlomax.com/api',
      apiKey: process.env.INLOMAX_API_KEY,
      authHeader: (key: string) => ({ 
        'Authorization': `Token ${key}`,
        'Authorization-Token': key // Fallback for some Inlomax sub-modules
      })
    },
    server2: {
      baseUrl: 'https://api.ciptopup.ng/api',
      apiKey: process.env.CIP_API_KEY,
      authHeader: (key: string) => ({ 'x-api-key': key })
    }
  };

  const selectedProvider = providers[server as keyof typeof providers] || providers.server1;

  if (!selectedProvider.apiKey) {
    return res.status(500).json({ status: 'error', message: `System: API key for ${server} is not configured in environment.` });
  }

  try {
    let cleanEndpoint = endpoint.replace(/^\//, '');
    
    // Inlomax endpoints often require a trailing slash for GET requests
    if (server === 'server1' && targetMethod.toUpperCase() === 'GET' && !cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('?')) {
      cleanEndpoint += '/';
    }

    let fullUrl = `${selectedProvider.baseUrl.replace(/\/$/, '')}/${cleanEndpoint}`;
    
    if (targetMethod.toUpperCase() === 'GET' && data && typeof data === 'object') {
       const params = new URLSearchParams();
       Object.entries(data).forEach(([key, val]) => {
         if (key !== 'server') params.append(key, String(val));
       });
       const queryString = params.toString();
       if (queryString) fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...selectedProvider.authHeader(selectedProvider.apiKey)
    };

    const fetchOptions: any = {
      method: targetMethod.toUpperCase(),
      headers,
    };

    if (targetMethod.toUpperCase() !== 'GET' && data) {
      let requestData = { ...data };
      
      // Strict Inlomax Data Mapping
      if (server === 'server1') {
        const mapped: any = {};
        // Service ID mapping
        mapped.serviceID = String(requestData.serviceID || requestData.plan_id || requestData.provider_id || requestData.type || '');
        
        // Identity mapping
        if (requestData.phone || requestData.mobileNumber || requestData.phone_number) {
          mapped.mobileNumber = String(requestData.phone || requestData.mobileNumber || requestData.phone_number);
        }
        
        if (requestData.smartcard || requestData.smartCardNumber || requestData.iucNum) {
          mapped.iucNum = String(requestData.smartcard || requestData.smartCardNumber || requestData.iucNum);
        }

        if (requestData.meterNum || requestData.meter_number) {
          mapped.meterNum = String(requestData.meterNum || requestData.meter_number);
        }

        // Configuration mapping
        if (requestData.amount) mapped.amount = Number(requestData.amount);
        if (requestData.quantity) mapped.quantity = Number(requestData.quantity);
        if (requestData.meterType) mapped.meterType = requestData.meterType === 'prepaid' || requestData.meterType === 1 ? 1 : 2;
        
        requestData = mapped;
      }
      
      fetchOptions.body = JSON.stringify(requestData);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
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
    return res.status(504).json({ status: 'error', message: 'Node Connectivity Timeout.' });
  }
}