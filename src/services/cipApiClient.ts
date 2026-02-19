
import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

/**
 * Enhanced API client that routes requests to independent proxy servers 
 * to ensure high availability and stability during concurrent transactions.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  const targetServer = data?.server || 'server1';
  
  // Isolated Proxy Selection
  const proxyPath = targetServer === 'server1' ? '/api/proxy-server1' : '/api/proxy-server2';

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
  
  // CIP (Server 2) standard format: { status: 'success', message: '...', data: ... }
  if (targetServer === 'server2') {
    if (rawData?.status === 'success') {
      return {
        status: true,
        message: rawData.message,
        data: rawData.data as T,
      };
    }
    const errorMsg = rawData?.message || rawData?.errors?.[0]?.message || 'Server 2 Error';
    return { status: false, message: errorMsg };
  }

  // Server 1 Fallback (Legacy Mapping)
  return {
    status: true,
    message: 'Success',
    data: rawData as T,
  };
}
