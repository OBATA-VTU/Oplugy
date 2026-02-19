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
    console.error(`[Proxy Error] Missing credentials for ${server}.`);
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
      let requestData = { ...data };
      
      // SERVER 1 (INLOMAX) PAYLOAD MAPPING
      if (server === 'server1') {
        // Inlomax strictly requires 'serviceID' and 'mobileNumber' for most POST requests
        const mappedData: any = {};
        
        // Map Service ID
        if (requestData.serviceID) mappedData.serviceID = String(requestData.serviceID);
        else if (requestData.plan_id) mappedData.serviceID = String(requestData.plan_id);
        else if (requestData.provider_id) mappedData.serviceID = String(requestData.provider_id);
        else if (requestData.network && endpoint === 'airtime') {
           // Airtime special mapping for Inlomax based on network strings if IDs aren't provided
           if (requestData.network.toUpperCase() === 'MTN') mappedData.serviceID = "1";
           if (requestData.network.toUpperCase() === 'AIRTEL') mappedData.serviceID = "2";
           if (requestData.network.toUpperCase() === 'GLO') mappedData.serviceID = "3";
           if (requestData.network.toUpperCase() === '9MOBILE') mappedData.serviceID = "4";
        }

        // Map Mobile Number
        if (requestData.mobileNumber) mappedData.mobileNumber = String(requestData.mobileNumber);
        else if (requestData.phone_number) mappedData.mobileNumber = String(requestData.phone_number);
        else if (requestData.phone) mappedData.mobileNumber = String(requestData.phone);
        else if (requestData.meterNum) mappedData.meterNum = String(requestData.meterNum);
        else if (requestData.meter_number) mappedData.meterNum = String(requestData.meter_number);

        // Map Amount
        if (requestData.amount) mappedData.amount = Number(requestData.amount);

        // Map Meter Type for Electricity
        if (requestData.meterType) mappedData.meterType = Number(requestData.meterType);
        else if (requestData.meter_type) mappedData.meterType = requestData.meter_type === 'prepaid' ? 1 : 2;

        // Map Quantity for Education
        if (requestData.quantity) mappedData.quantity = Number(requestData.quantity);

        requestData = mappedData;
      }
      
      fetchOptions.body = JSON.stringify(requestData);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    
    try {
      const responseData = JSON.parse(responseText);
      // Ensure we return a consistent 200 even if the underlying API has a different success code
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).send(responseText);
    }
  } catch (error: any) {
    console.error(`[Proxy Fatal] Connection to ${server} failed:`, error.message);
    return res.status(504).json({ status: 'error', message: 'The gateway connection timed out.' });
  }
}