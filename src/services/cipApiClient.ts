import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

/**
 * A specialized API client for interacting with our Vercel proxy.
 * It forwards the 'server' flag so the proxy knows which credentials to use.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  const targetServer = data?.server || 'server2';

  const proxyPayload = {
    endpoint: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data,
    server: targetServer
  };

  const response = await apiClient<any>(
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
      message: response.message || 'Gateway Error',
      data: undefined,
    };
  }
  
  const rawData = response.data;
  
  // Logic to handle different provider response formats
  // CIP (Server 2) usually returns { status: 'success', data: ... }
  // Inlomax (Server 1) returns the raw object directly e.g. { dataPlans: [...] }
  
  if (rawData?.status === 'success') {
    return {
      status: true,
      message: rawData.message,
      data: rawData.data as T,
    };
  } 
  
  // If the response is not wrapped but looks successful (e.g. contains expected keys)
  if (rawData && !rawData.status && (rawData.dataPlans || rawData.airtime || rawData.electricity || Array.isArray(rawData))) {
    return {
      status: true,
      message: 'Success',
      data: rawData as T,
    };
  }

  // Handle explicit failure statuses from wrapped APIs
  if (rawData?.status === 'fail' || rawData?.status === 'error') {
     const errorMessages = rawData?.errors?.map((e: any) => `${e.path}: ${e.message}`) || [rawData?.message || 'API Error'];
     return {
       status: false,
       message: errorMessages.join(', '),
       errors: errorMessages,
     };
  }

  // Fallback for raw objects that don't match the success criteria above
  return {
    status: true,
    message: 'Success',
    data: rawData as T,
  };
}