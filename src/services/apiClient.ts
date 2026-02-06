import { ApiResponse } from '../types';

interface RequestOptions extends RequestInit {
  token?: string;
  xApiKey?: string; // New field for CIP API key
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
    mode: 'cors', // Explicitly set mode to 'cors' for cross-origin requests
    ...customConfig,
  };

  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log(`Making API call to: ${fullUrl} with method: ${config.method}`);
  
  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      let errorData: any;
      let errorText: string | null = null;
      try {
        // First, try to parse as JSON, which is the expected error format
        errorData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, read it as text for logging
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = "Could not read error response body.";
        }
        errorData = null; // No valid JSON
      }

      // Log detailed error information for Vercel debugging
      console.error(
        '--- API CLIENT HTTP ERROR ---',
        `\n- URL: ${fullUrl}`,
        `\n- Method: ${config.method}`,
        `\n- Status: ${response.status}`,
        `\n- Status Text: ${response.statusText}`,
        `\n- Response Body (JSON):`, errorData,
        `\n- Response Body (Raw Text):`, errorText
      );

      const errorMessage = errorData?.message || (errorData?.errors && errorData.errors[0]?.message) || response.statusText || 'An unknown error occurred';
      return { data: undefined, message: errorMessage, status: false, errors: errorData?.errors?.map((err: any) => err.message) || [errorMessage] };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      const apiStatus = result.status === 'success';
      console.log(`API call to ${fullUrl} successful.`);
      return { data: result.data, message: result.message, status: apiStatus, errors: result.errors };
    } else {
      console.log(`API call to ${fullUrl} successful with non-JSON response.`);
      return { data: undefined, message: response.statusText, status: true };
    }
  } catch (error: any) {
    // Log detailed network error information for Vercel debugging
    console.error(
        '--- API CLIENT NETWORK/CORS ERROR ---',
        `\n- URL: ${fullUrl}`,
        `\n- Method: ${config.method}`,
        `\n- Error Name: ${error.name}`,
        `\n- Error Message: ${error.message}`,
        `\n- Note: This often indicates a network issue, a CORS problem (check server headers), or that the API endpoint is down.`
    );
    return { data: undefined, message: error.message || 'Network error, please check your connection or contact support.', status: false, errors: [error.message] };
  }
}