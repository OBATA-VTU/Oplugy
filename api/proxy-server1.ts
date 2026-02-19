
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method = 'GET', data } = payload || {};

  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Inlomax API key not configured.' });
  }

  try {
    let cleanEndpoint = (endpoint || '').replace(/^\//, '');
    if (method.toUpperCase() === 'GET' && cleanEndpoint && !cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('?')) {
      cleanEndpoint += '/';
    }

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
      'Authorization': `Token ${apiKey}`,
      'Authorization-Token': apiKey 
    };

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      // Inlomax mapping logic
      const mapped: any = { ...data };
      if (data.plan_id) mapped.serviceID = String(data.plan_id);
      if (data.phone_number) mapped.mobileNumber = String(data.phone_number);
      fetchOptions.body = JSON.stringify(mapped);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
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
    return res.status(504).json({ status: 'error', message: 'Inlomax Node Connectivity Timeout.' });
  }
}
