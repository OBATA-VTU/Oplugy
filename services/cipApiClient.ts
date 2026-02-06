import { apiClient } from './apiClient';
import { CIP_API_BASE_URL_DEV, CIP_API_KEY_DEV } from '../constants.ts'; // Removed CORS_PROXY_URL
import { ApiResponse } from '../types';

/**
 * A specialized API client for interacting with the CIP Top Up API.
 * It's pre-configured with the CIP base URL and API key.
 */
export async function cipApiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: { data?: any; headers?: HeadersInit; method?: string } = {}
): Promise<ApiResponse<T>> {
  // Directly call the generic apiClient with the Cyberbeats base URL and the provided endpoint.
  // The 'mode: "cors"' is handled by apiClient.
  return apiClient<T>(
    CIP_API_BASE_URL_DEV, // Base URL for CIP
    endpoint, // Specific endpoint for the CIP service
    {
      data,
      headers: customHeaders,
      xApiKey: CIP_API_KEY_DEV, // Automatically attach the CIP API Key
      ...customConfig,
    }
  );
}