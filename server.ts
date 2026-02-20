import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;
const CRA_PORT = 3001;

app.use(cors());

// API routes should NOT use express.json() if they are being proxied or handled specially, 
// but here we handle it manually so it's fine.
app.use(express.json());

// Inlomax Proxy Route (Server 1)
app.post('/api/proxy-server1', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
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
      if (data.meterNum || data.meter_number) mapped.meterNum = String(data.meterNum || data.meter_number);
      if (data.meterType !== undefined) mapped.meterType = (data.meterType === 'prepaid' || data.meterType === 1) ? 1 : 2;
      if (data.iucNum || data.smartCardNumber || data.smartcard) mapped.iucNum = String(data.iucNum || data.smartCardNumber || data.smartcard);

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
});

// Ciptopup Proxy Route (Server 2)
app.post('/api/proxy-server2', async (req, res) => {
  const { endpoint, method = 'GET', data } = req.body || {};
  const apiKey = process.env.CIPTOPUP_API_KEY;
  const baseUrl = 'https://api.ciptopup.ng/api'; 

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
      const payload: any = { ...data };
      
      // Mapping for Ciptopup specific endpoints
      if (cleanEndpoint === 'data/buy') {
        if (data.serviceID) payload.plan_id = data.serviceID;
        if (data.mobileNumber) payload.phone_number = data.mobileNumber;
      }

      fetchOptions.body = JSON.stringify(payload);
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
        message: 'Ciptopup Node Gateway Error.',
        raw: responseText.substring(0, 150)
      });
    }
  } catch (error: any) {
    return res.status(504).json({ status: 'error', message: 'Ciptopup Node Connectivity Error.' });
  }
});

// Proxy all other requests to the CRA dev server
app.use('/', createProxyMiddleware({
  target: `http://localhost:${CRA_PORT}`,
  changeOrigin: true,
  ws: true, // support websockets for HMR
  logLevel: 'error'
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
});
