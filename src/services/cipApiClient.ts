import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

/**
 * Multi-node API client routing requests to either Server 1 (Inlomax) or Server 2 (Ciptopup).
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method, server = 1 }: { data?: any; headers?: HeadersInit; method?: string; server?: 1 | 2 } = {}
): Promise<ApiResponse<T>> {
  
  const proxyPath = server === 1 ? '/api/proxy-server1' : '/api/proxy-server2';

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
  
  // Handle direct array response (often used for plan lists)
  if (Array.isArray(rawData)) {
    return {
      status: true,
      message: 'Success',
      data: rawData as T,
    };
  }

  // Handle standard success formats
  if (rawData?.status === 'success' || rawData?.status === true || rawData?.success === true) {
    return {
      status: true,
      message: rawData.message || 'Transaction Successful',
      data: (rawData.data !== undefined ? rawData.data : rawData) as T,
    };
  }

  const errorMsg = rawData?.message || 'Fulfillment Node Rejected Request';
  return { status: false, message: errorMsg };
}
