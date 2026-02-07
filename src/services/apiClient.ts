
import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  xApiKey?: string;
  data?: any;
}

export async function apiClient<T>(
  baseUrl: string,
  endpoint: string,
  { data, headers: customHeaders, token, xApiKey, ...customConfig }: RequestOptions = {}
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

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers,
    ...customConfig,
  };

  const fullUrl = `${baseUrl}/${endpoint}`;
  
  try {
    const response = await fetch(fullUrl, config);
    // Clone the response so we can read it twice (once as text, once as JSON) if needed
    const clonedResponse = response.clone();

    try {
      const result = await response.json();

      if (!response.ok) {
        console.error(
          '[OPLUG_CLIENT_ERROR] --- API CLIENT HTTP ERROR ---',
          `\n- URL: ${fullUrl}\n- Method: ${config.method}\n- Status: ${response.status} ${response.statusText}\n- Response Body:`, result
        );
        const errorMessage = result?.message || response.statusText || 'An unknown error occurred';
        return { data: undefined, message: errorMessage, status: false, errors: result?.errors || [errorMessage] };
      }
      
      return { data: result.data, message: result.message, status: result.status === 'success' || result.status === true, errors: result.errors };

    } catch (jsonError) {
      // This catch block runs if response.json() fails.
      const responseText = await clonedResponse.text(); // Read the text from the clone for logging
      console.error(
        '[OPLUG_CLIENT_ERROR] --- FAILED TO PARSE JSON RESPONSE ---',
        `\n- URL: ${fullUrl}`,
        `\n- Status: ${response.status} ${response.statusText}`,
        `\n- Note: This is the source of the 'Unexpected end of JSON input' error.`,
        `\n- Raw Response Body (non-JSON):`, `"${responseText}"` // Quoted to show whitespace/emptiness
      );
      return { data: undefined, message: 'Received an invalid response from the server.', status: false, errors: ['Invalid server response.'] };
    }

  } catch (error: any) {
    console.error(
        '[OPLUG_CLIENT_ERROR] --- API CLIENT NETWORK/FETCH ERROR ---',
        `\n- URL: ${fullUrl}\n- Method: ${config.method}\n- Error Name: ${error.name}\n- Error Message: ${error.message}`
    );
    return { data: undefined, message: error.message || 'Network error, please check your connection.', status: false, errors: [error.message] };
  }
}
