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

    if (['payelectric', 'subcable', 'validatemeter', 'validatecable'].includes(cleanEndpoint)) {
      headers['Authorization-Token'] = apiKey;
    }

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      const mapped: any = {};
      
      const rawServiceID = String(data.serviceID || data.plan_id || data.type || data.provider_id || data.network || '');
      
      // Strict mapping logic for Inlomax nodes
      // ONLY lowercase if it's a cable tag (DSTV, GOTV) or airtime tag and NOT a numeric ID.
      if (['validatecable', 'subcable', 'airtime'].includes(cleanEndpoint) && isNaN(Number(rawServiceID))) {
        mapped.serviceID = rawServiceID.toLowerCase();
      } else {
        // Data and Education IDs must remain exactly as sent (numeric strings)
        mapped.serviceID = rawServiceID;
      }
      
      if (data.mobileNumber || data.phone || data.phone_number) {
        mapped.mobileNumber = String(data.mobileNumber || data.phone || data.phone_number);
      }

      if (data.amount) mapped.amount = Number(data.amount);
      if (data.quantity !== undefined) mapped.quantity = Number(data.quantity);
      
      if (data.meterNum || data.meter_number) {
        mapped.meterNum = String(data.meterNum || data.meter_number);
      }

      if (data.meterType !== undefined) {
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
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).json({ 
        status: 'error', 
        message: responseText.includes('Fatal error') ? 'Node Fulfillment Failure: Check liquidity.' : 'Gateway Protocol Error.',
        raw: responseText.substring(0, 150)
      });
    }

  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Fulfillment Node Connectivity Error.' });
  }
}