import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key, Authorization-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method = 'GET', data } = payload || {};

  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Inlomax API key not configured in environment.' });
  }

  try {
    const cleanEndpoint = (endpoint || '').replace(/^\//, '');
    let fullUrl = `${baseUrl}/${cleanEndpoint}`;
    
    if (method.toUpperCase() === 'GET' && data) {
       const params = new URLSearchParams();
       Object.entries(data).forEach(([k, v]) => params.append(k, String(v)));
       const qs = params.toString();
       if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${apiKey}`
    };

    // Specific endpoints requiring Authorization-Token header per Inlomax Docs
    if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(cleanEndpoint)) {
      headers['Authorization-Token'] = apiKey;
    }

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      const mapped: any = {};
      
      // Strict ID Mapping
      const rawServiceID = String(data.serviceID || data.plan_id || data.type || data.provider_id || data.network || '');
      
      // Carriers and Biller Tags MUST be lowercase for certain nodes
      if (['airtime', 'validatecable', 'subcable'].includes(cleanEndpoint)) {
        mapped.serviceID = rawServiceID.toLowerCase();
      } else {
        mapped.serviceID = rawServiceID;
      }
      
      if (data.mobileNumber || data.phone || data.phone_number) {
        mapped.mobileNumber = String(data.mobileNumber || data.phone || data.phone_number);
      }

      if (data.amount) mapped.amount = Number(data.amount);
      if (data.quantity) mapped.quantity = Number(data.quantity);
      
      if (data.meterNum || data.meter_number) {
        mapped.meterNum = String(data.meterNum || data.meter_number);
      }

      if (data.meterType !== undefined) {
        // prepaid = 1, postpaid = 2
        mapped.meterType = (data.meterType === 'prepaid' || data.meterType === 1) ? 1 : 2;
      }

      if (data.iucNum || data.smartCardNumber || data.smartcard) {
        mapped.iucNum = String(data.iucNum || data.smartCardNumber || data.smartcard);
      }

      fetchOptions.body = JSON.stringify(mapped);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);
    fetchOptions.signal = controller.signal;

    const apiResponse = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeout);
    
    const responseText = await apiResponse.text();
    try {
      const responseData = JSON.parse(responseText);
      // Ensure the proxy returns a consistent JSON structure
      return res.status(200).json(responseData);
    } catch {
      // If server returns HTML or raw text (Fatal Error), wrap it for the frontend
      return res.status(apiResponse.status).json({ 
        status: 'error', 
        message: responseText.includes('Fatal error') ? 'Node Fulfillment Error: Check carrier balance.' : 'Invalid Response From Provider.',
        raw: responseText.substring(0, 150)
      });
    }

  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Fulfillment Node Connectivity Error.' });
  }
}