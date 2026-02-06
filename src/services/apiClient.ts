import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  xApiKey?: string; // This is now unused here, but kept for other potential APIs
  data?: any;
}

export async function apiClient<T>(
  baseUrl: string, // Base URL is now a parameter
  endpoint: string,
  { data, headers: customHeaders, token, xApiKey, ...customConfig }: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (xApiKey) {
    headers['x-api-key'] = xApiKey;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customConfig,
  };

  const fullUrl = `${baseUrl}/${endpoint}`;
  
  try {
    const response = await fetch(fullUrl, config);

    // Unlike the proxy, the client needs to handle the response differently
    // as it expects our proxy to always return JSON.
    const result = await response.json();

    if (!response.ok) {
      // Log detailed error information for Vercel debugging
      console.error(
        '[OPLUG_CLIENT_ERROR] --- API CLIENT HTTP ERROR ---',
        `\n- URL: ${fullUrl}`,
        `\n- Method: ${config.method}`,
        `\n- Status: ${response.status}`,
        `\n- Status Text: ${response.statusText}`,
        `\n- Response Body:`, result
      );
      
      const errorMessage = result?.message || response.statusText || 'An unknown error occurred';
      return { data: undefined, message: errorMessage, status: false, errors: result?.errors || [errorMessage] };
    }
    
    // The proxy now standardizes the response format
    return { data: result.data, message: result.message, status: result.status === 'success' || result.status === true, errors: result.errors };

  } catch (error: any) {
    // Log detailed network error information for Vercel debugging
    console.error(
        '[OPLUG_CLIENT_ERROR] --- API CLIENT NETWORK/FETCH ERROR ---',
        `\n- URL: ${fullUrl}`,
        `\n- Method: ${config.method}`,
        `\n- Error Name: ${error.name}`,
        `\n- Error Message: ${error.message}`,
        `\n- Note: This often indicates a network issue between the browser and the Vercel proxy, or a problem with the proxy deployment itself.`
    );
    return { data: undefined, message: error.message || 'Network error, please check your connection or contact support.', status: false, errors: [error.message] };
  }
}
