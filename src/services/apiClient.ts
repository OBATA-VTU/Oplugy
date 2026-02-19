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
  { data, headers: customHeaders, token, xApiKey, timeout = 60000, ...customConfig }: RequestOptions = {}
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

  // Use token if available in state or explicitly passed
  const sessionToken = token || localStorage.getItem('oplug_token');
  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  if (xApiKey) {
    headers.set('x-api-key', xApiKey);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Normalize endpoint: ensure it starts with / and handle full URLs if passed
  const fullUrl = endpoint.startsWith('http') ? endpoint : (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

  const method = (customConfig.method as string) || (data ? 'POST' : 'GET');

  const config: RequestInit = {
    ...customConfig,
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers,
    signal: controller.signal,
  };

  try {
    const response = await fetch(fullUrl, config);
    clearTimeout(timeoutId);

    const clonedResponse = response.clone();

    try {
      const result = await response.json();

      if (!response.ok) {
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
      return { data: undefined, message: 'Invalid server response', status: false, errors: [responseText.substring(0, 100)] };
    }

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { data: undefined, message: 'Request took too long (Timeout)', status: false };
    }
    return { data: undefined, message: error.message || 'Network error', status: false };
  }
}