
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
    endpoint: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data,
  };

  // We use '/api/proxy' to call our local Vercel function relative to the domain root
  const response = await apiClient<CipApiResponse<T>>(
    '', // Relative to current domain
    '/api/proxy',
    {
      data: proxyPayload,
      method: 'POST',
      headers: customHeaders,
    }
  );
  
  if (!response.status) {
    return {
      status: false,
      message: response.message,
      data: undefined,
      errors: response.errors,
    };
  }
  
  const cipData = response.data;
  
  if (cipData?.status === 'success') {
    return {
      status: true,
      message: cipData.message,
      data: cipData.data as T,
    };
  } else {
    const errorMessages = cipData?.errors?.map(e => `${e.path}: ${e.message}`) || [cipData?.message || 'An unknown API error occurred.'];
    return {
      status: false,
      message: errorMessages.join(', '),
      errors: errorMessages,
    };
  }
}
