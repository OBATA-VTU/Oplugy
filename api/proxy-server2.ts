import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key, Authorization-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method = 'GET', data } = payload || {};

  const apiKey = process.env.CIPTOPUP_API_KEY;
  const baseUrl = 'https://api.ciptopup.ng/api';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Ciptopup API key not configured in environment.' });
  }

  try {
    const cleanEndpoint = (endpoint || '').replace(/^\//, '');
    let fullUrl = `${baseUrl}/${cleanEndpoint}`;
    
    if (method.toUpperCase() === 'GET' && data) {
       const params = new URLSearchParams();
       Object.entries(data).forEach(([k, v]) => {
         if (v !== undefined && v !== null && v !== '') {
           params.append(k, String(v));
         }
       });
       const qs = params.toString();
       if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': apiKey
    };

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      const bodyPayload: any = { ...data };
      if (cleanEndpoint === 'data/buy') {
        if (data.serviceID) bodyPayload.plan_id = data.serviceID;
        if (data.mobileNumber) bodyPayload.phone_number = data.mobileNumber;
      }
      fetchOptions.body = JSON.stringify(bodyPayload);
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
        message: 'Gateway Protocol Error.',
        raw: responseText.substring(0, 150)
      });
    }

  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Fulfillment Node Connectivity Error.' });
  }
}
