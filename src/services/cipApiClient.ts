import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

/**
 * Optimized API client strictly routing all requests to the Inlomax (Server 1) Node.
 * All Server 2 logic has been decommissioned.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  
  const proxyPath = '/api/proxy-server1';

  const proxyPayload = {
    endpoint: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data
  };

  const response = await apiClient<any>(
    '', 
    proxyPath,
    {
      data: proxyPayload,
      method: 'POST',
      headers: customHeaders,
    }
  );
  
  if (!response.status) {
    return {
      status: false,
      message: response.message || 'Node Connectivity Error',
      data: undefined,
    };
  }
  
  const rawData = response.data;
  
  // Inlomax documentation returns { status: 'success', data: { ... } } or error
  if (rawData?.status === 'success') {
    return {
      status: true,
      message: rawData.message || 'Transaction Successful',
      data: rawData.data as T,
    };
  }

  const errorMsg = rawData?.message || 'Fulfillment Node Rejected Request';
  return { status: false, message: errorMsg };
}