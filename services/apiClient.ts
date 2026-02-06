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

  // Fix: Correctly construct the full URL. If endpoint is empty, it means baseUrl already contains the full path (e.g., proxied URL).
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log('Making API call to:', fullUrl);
  console.log('Request config:', config);
  console.log('Request headers (including x-api-key):', headers);

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, or empty, provide a generic error message
        const errorMessage = `HTTP error! status: ${response.status} - ${response.statusText || 'Unknown error'}`;
        console.error('API call failed with non-JSON response:', errorMessage, response);
        return { data: undefined, message: errorMessage, status: false, errors: [errorMessage] };
      }
      // CIP API uses "status: 'error'" and provides `message` and `errors` in 4XX responses.
      const errorMessage = errorData.message || (errorData.errors && errorData.errors[0]?.message) || 'An unknown error occurred';
      console.error('API call failed with JSON error:', errorData);
      return { data: undefined, message: errorMessage, status: false, errors: errorData.errors?.map((err: any) => err.message) || [errorMessage] };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      // CIP API uses "status": "success"/"error" strings. Map this to boolean.
      const apiStatus = result.status === 'success';
      console.log('API call successful, response:', result);
      return { data: result.data, message: result.message, status: apiStatus, errors: result.errors };
    } else {
      // Handle cases where API returns non-JSON but still successful (e.g., 204 No Content)
      console.log('API call successful, non-JSON response:', response);
      return { data: undefined, message: response.statusText, status: true };
    }
  } catch (error: any) {
    console.error('API call failed (network or unexpected error):', error);
    return { data: undefined, message: error.message || 'Network error', status: false, errors: [error.message] };
  }
}