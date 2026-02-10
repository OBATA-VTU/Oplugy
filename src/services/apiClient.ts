
import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  xApiKey?: string;
  data?: any;
  timeout?: number; 
}

export async function apiClient<T>(
  baseUrl: string,
  endpoint: string,
  { data, headers: customHeaders, token, xApiKey, timeout = 15000, ...customConfig }: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  if (customHeaders) {
    new Headers(customHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (xApiKey) {
    headers.set('x-api-key', xApiKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // If baseUrl is provided, use it. Otherwise, assume it's a relative path to the root.
  // This is safer for mobile browsers than trying to construct an absolute URL with origin.
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}${cleanEndpoint}` : cleanEndpoint;

  const method = (customConfig.method as string) || (data ? 'POST' : 'GET');

  const config: RequestInit = {
    ...customConfig,
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers,
    signal: controller.signal,
  };

  console.log(`[OPLUG_DEBUG] Sending ${method} request to: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    const clonedResponse = response.clone();

    try {
      const result = await response.json();

      if (!response.ok) {
        console.error(
          '[OPLUG_CLIENT_ERROR] --- API CLIENT HTTP ERROR ---',
          `\n- URL: ${fullUrl}\n- Method: ${method}\n- Status: ${response.status} ${response.statusText}\n- Response Body:`, result
        );
        const errorMessage = result?.message || response.statusText || 'An unknown error occurred';
        return { data: undefined, message: errorMessage, status: false, errors: result?.errors?.map((e: any) => e.message) || [errorMessage] };
      }
      
      return {
        status: true,
        message: 'Request successful',
        data: result,
      };

    } catch (jsonError) {
      const responseText = await clonedResponse.text();
      let userMessage = 'Received an invalid response from the server.';
      
      if (clonedResponse.status === 405) {
        userMessage = 'Method Not Allowed. This is usually a routing error. Please ensure you are calling the correct API endpoint.';
      } else if (clonedResponse.status === 504) {
        userMessage = 'The server took too long to respond (Gateway Timeout). Please try again later.';
      } else if (clonedResponse.status === 502) {
        userMessage = 'A temporary issue occurred with the payment provider (Bad Gateway). Please try again later.';
      }
      
      console.error(
        '[OPLUG_CLIENT_ERROR] --- FAILED TO PARSE JSON RESPONSE ---',
        `\n- URL: ${fullUrl}`,
        `\n- Method: ${method}`,
        `\n- Status: ${clonedResponse.status} ${clonedResponse.statusText}`,
        `\n- User Message: ${userMessage}`,
        `\n- RAW RESPONSE BODY:\n------------------\n${responseText}\n------------------`
      );
      return { data: undefined, message: userMessage, status: false, errors: [userMessage] };
    }

  } catch (error: any) {
    clearTimeout(timeoutId);
    let userMessage = error.message || 'Network error, please check your connection.';
    
    if (error.name === 'AbortError') {
      userMessage = 'The request timed out. Please check your connection and try again.';
    }

    console.error(
        '[OPLUG_CLIENT_ERROR] --- API CLIENT NETWORK/FETCH ERROR ---',
        `\n- URL: ${fullUrl}\n- Method: ${method}\n- Error Name: ${error.name}\n- Error Message: ${error.message}`
    );
    return { data: undefined, message: userMessage, status: false, errors: [userMessage] };
  }
}
