import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-api-key, Authorization-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { server: serverQuery } = req.query;
  const payload = req.method === 'POST' ? req.body : req.query;
  const { endpoint, method = 'GET', data, server: serverBody } = payload || {};
  
  const server = Number(serverQuery || serverBody || 1);

  if (server === 1) {
    return await handleServer1(req, res, endpoint, method, data);
  } else if (server === 2) {
    return await handleServer2(req, res, endpoint, method, data);
  } else if (server === 3 || serverQuery === 'paystack') {
    return await handlePaystack(req, res, endpoint, method, data);
  } else if (serverQuery === 'billstack') {
    return await handleBillstack(req, res, endpoint, method, data);
  } else if (serverQuery === 'smm') {
    return await handleSMM(req, res, endpoint, method, data);
  } else {
    return res.status(400).json({ status: 'error', message: 'Invalid server specified.' });
  }
}

async function handleBillstack(req: VercelRequest, res: VercelResponse, endpoint: string, method: string, data: any) {
  const secretKey = process.env.BILLSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ status: false, message: 'Billstack Secret Key not configured.' });
  }

  try {
    const fullUrl = `https://api.billstack.co/${(endpoint || '').replace(/^\//, '')}`;
    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    };

    const options: any = {
      method: method.toUpperCase(),
      headers
    };

    if (method.toUpperCase() !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);
    const responseText = await response.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(response.status).json({ status: false, message: 'Billstack Protocol Error.', raw: responseText });
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

async function handleSMM(req: VercelRequest, res: VercelResponse, endpoint: string, method: string, data: any) {
  const apiKey = process.env.OGAVIRAL_API_KEY;
  const baseUrl = 'https://ogaviral.com/api/v2';

  if (!apiKey) {
    return res.status(500).json({ status: false, message: 'SMM API key not configured.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('key', apiKey);
    
    // Ogaviral uses 'action' instead of endpoint in some cases, 
    // but our smmService might pass it as endpoint or in data.
    const action = data?.action || endpoint || 'services';
    params.append('action', action);
    
    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        if (k !== 'action' && v !== undefined && v !== null) {
          params.append(k, String(v));
        }
      });
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const responseText = await response.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(response.status).json({ status: false, message: 'SMM Protocol Error.', raw: responseText });
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

async function handlePaystack(req: VercelRequest, res: VercelResponse, endpoint: string, method: string, data: any) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ status: false, message: 'Paystack Secret Key not configured.' });
  }

  try {
    const fullUrl = `https://api.paystack.co/${(endpoint || '').replace(/^\//, '')}`;
    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    };

    const options: any = {
      method: method.toUpperCase(),
      headers
    };

    if (method.toUpperCase() !== 'GET' && data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);
    const responseText = await response.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(response.status).json({ status: false, message: 'Paystack Protocol Error.', raw: responseText });
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, message: error.message });
  }
}

async function handleServer1(req: VercelRequest, res: VercelResponse, endpoint: string, method: string, data: any) {
  const apiKey = process.env.INLOMAX_API_KEY;
  const baseUrl = 'https://inlomax.com/api';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Inlomax API key not configured.' });
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
      
      if (['validatecable', 'subcable', 'airtime'].includes(cleanEndpoint) && isNaN(Number(rawServiceID))) {
        mapped.serviceID = rawServiceID.toLowerCase();
      } else {
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

    const apiResponse = await fetch(fullUrl, fetchOptions);
    const responseText = await apiResponse.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).json({ status: 'error', message: 'Gateway Protocol Error.', raw: responseText.substring(0, 150) });
    }
  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Fulfillment Node Connectivity Error.' });
  }
}

async function handleServer2(req: VercelRequest, res: VercelResponse, endpoint: string, method: string, data: any) {
  const apiKey = process.env.CIPTOPUP_API_KEY;
  const baseUrl = 'https://ciptopup.com/api/v1';

  if (!apiKey) {
    return res.status(500).json({ status: 'error', message: 'Ciptopup API key not configured.' });
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
      'x-api-key': apiKey
    };

    const fetchOptions: any = {
      method: method.toUpperCase(),
      headers,
    };

    if (method.toUpperCase() !== 'GET' && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    const apiResponse = await fetch(fullUrl, fetchOptions);
    const responseText = await apiResponse.text();
    try {
      const responseData = JSON.parse(responseText);
      return res.status(200).json(responseData);
    } catch {
      return res.status(apiResponse.status).json({ status: 'error', message: 'Gateway Protocol Error.', raw: responseText.substring(0, 150) });
    }
  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Fulfillment Node Connectivity Error.' });
  }
}
