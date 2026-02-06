import { apiClient } from './apiClient';
import { ApiResponse } from '../types';

/**
 * A specialized API client for interacting with our own proxy to the CIP Top Up API.
 * This abstracts away the proxy call, so services can use it as before.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, method }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  // All requests now go through our own serverless proxy to handle CORS and API keys securely.
  // The proxy endpoint is '/api/proxy'.
  // We pass the target CIP endpoint and payload in the body of our request to the proxy.
  const proxyPayload = {
    endpoint,
    method: method || (data ? 'POST' : 'GET'),
    data,
  };

  // We use the generic apiClient to call our own proxy.
  // The first argument to apiClient is the base URL, which is empty for a local endpoint.
  // The second is the endpoint path. The base URL will be the domain the app is hosted on.
  return apiClient<T>(
    '', // Base URL is our own domain, so it's empty
    'api/proxy', // The path to our serverless function
    {
      data: proxyPayload, // The body of the request to our proxy
      method: 'POST',     // All requests to the proxy itself are POST
      headers: customHeaders, // Pass any custom headers along
    }
  );
}
