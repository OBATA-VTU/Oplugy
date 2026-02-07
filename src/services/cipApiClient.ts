

import { apiClient } from './apiClient';
import { ApiResponse, CipApiResponse } from '../types';

/**
 * A specialized API client for interacting with our own proxy to the CIP Top Up API.
 * It translates the raw CIP API response into a standardized format for the rest of the app.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  const proxyPayload = {
    endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data,
  };

  // Use the generic apiClient to call our own proxy. Base URL is empty for a local endpoint.
  const response = await apiClient<CipApiResponse<T>>(
    '', // Our own domain
    'api/proxy',
    {
      data: proxyPayload,
      method: 'POST',
      headers: customHeaders,
    }
  );
  
  // If the fetch call itself failed (network error, etc.), apiClient returns a formatted error.
  if (!response.status) {
    // FIX: The type of `response` is `ApiResponse<CipApiResponse<T>>`, which is not directly
    // assignable to the required return type `ApiResponse<T>`.
    // In this error case, `response.data` is `undefined`. We create a new object that
    // matches the `ApiResponse<T>` structure, letting TypeScript correctly infer the types.
    return {
      status: false,
      message: response.message,
      data: undefined,
      errors: response.errors,
    };
  }
  
  // The fetch was successful, but the CIP API might have returned an error.
  // We translate the CIP format to our app's standard format.
  const cipData = response.data; // This is the CipApiResponse<T>
  
  if (cipData?.status === 'success') {
    return {
      status: true,
      message: cipData.message,
      data: cipData.data as T,
    };
  } else {
    // Map CIP errors to a simple string array for notifications.
    const errorMessages = cipData?.errors?.map(e => `${e.path}: ${e.message}`) || [cipData?.message || 'An unknown API error occurred.'];
    return {
      status: false,
      message: errorMessages.join(', '),
      errors: errorMessages,
    };
  }
}
