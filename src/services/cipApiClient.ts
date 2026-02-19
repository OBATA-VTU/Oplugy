import { apiClient } from './apiClient';
import { ApiResponse, CipApiResponse } from '../types';

/**
 * A specialized API client for interacting with our Vercel proxy.
 * It forwards the 'server' flag so the proxy knows which credentials to use.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  // Extract server from data if present, default to server2
  const targetServer = data?.server || 'server2';

  const proxyPayload = {
    endpoint: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data,
    server: targetServer
  };

  const response = await apiClient<CipApiResponse<T>>(
    '', 
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
    const errorMessages = cipData?.errors?.map(e => `${e.path}: ${e.message}`) || [cipData?.message || 'The API returned an error.'];
    return {
      status: false,
      message: errorMessages.join(', '),
      errors: errorMessages,
    };
  }
}