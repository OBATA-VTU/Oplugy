
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
  { data, headers: customHeaders, token, xApiKey, timeout = 20000, ...customConfig }: RequestOptions = {}
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

  // For Vercel, relative paths starting with /api/ are correctly routed to the api folder.
  const fullUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const method = (customConfig.method as string) || (data ? 'POST' : 'GET');

  const config: RequestInit = {
    ...customConfig,
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers,
    signal: controller.signal,
  };

  console.log(`[OPLUG_DEBUG] Fetching ${method}: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    const clonedResponse = response.clone();

    try {
      const result = await response.json();

      if (!response.ok) {
        console.error(
          '[OPLUG_CLIENT_ERROR] --- API ERROR ---',
          `\n- URL: ${fullUrl}\n- Status: ${response.status}\n- Data:`, result
        );
        const errorMessage = result?.message || response.statusText || 'An error occurred';
        return { data: undefined, message: errorMessage, status: false, errors: result?.errors?.map((e: any) => e.message) || [errorMessage] };
      }
      
      return {
        status: true,
        message: 'Success',
        data: result,
      };

    } catch (jsonError) {
      const responseText = await clonedResponse.text();
      let userMessage = 'Received an invalid response from the server.';
      
      if (clonedResponse.status === 405) {
        userMessage = 'Routing Error (405): The server rejected the request method. This often means the API endpoint was not found.';
      } else if (clonedResponse.status === 504) {
        userMessage = 'Server Timeout: The payment provider is taking too long.';
      }
      
      console.error(
        '[OPLUG_CLIENT_ERROR] --- PARSE ERROR ---',
        `\n- URL: ${fullUrl}`,
        `\n- Status: ${clonedResponse.status}`,
        `\n- Body Snippet: ${responseText.substring(0, 100)}`
      );
      return { data: undefined, message: userMessage, status: false, errors: [userMessage] };
    }

  } catch (error: any) {
    clearTimeout(timeoutId);
    let userMessage = error.message || 'Network error.';
    if (error.name === 'AbortError') userMessage = 'Request timed out.';

    console.error('[OPLUG_CLIENT_ERROR] --- NETWORK ERROR ---', `\n- URL: ${fullUrl}\n- Error: ${error.message}`);
    return { data: undefined, message: userMessage, status: false, errors: [userMessage] };
  }
}
