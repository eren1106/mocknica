/* eslint-disable @typescript-eslint/no-explicit-any */

export const apiRequest = {
  post: async (endpoint: string, data?: any, token?: string) => {
    return requestWithFetch({ method: 'POST', endpoint, data, token });
  },
  get: async (endpoint: string, token?: string) => {
    return requestWithFetch({ method: 'GET', endpoint, token });
  },
  put: async (endpoint: string, data?: any, token?: string) => {
    return requestWithFetch({ method: 'PUT', endpoint, data, token });
  },
  delete: async (endpoint: string, token?: string) => {
    return requestWithFetch({ method: 'DELETE', endpoint, token });
  },
};

interface FetchRequestParams {
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  token?: string;
}

async function requestWithFetch({
  method,
  endpoint,
  data,
  token
}: FetchRequestParams) {
  try {
    const res = await fetch(`/api/${endpoint}`, {
      method,
      body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
      headers: {
        // Only set 'Content-Type' if the data is not FormData, as FormData sets its own headers
        ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store' // TODO: make sure this is for server side only
    });

    if (res.status === 204) return;

    if (!(res.status >= 200 && res.status < 300)) {
      let responseMessage = 'An error occurred';

      try {
        const response = await res.json();
        responseMessage = response.message || responseMessage;
      } catch (error) {
        throw new Error('Failed to parse response as JSON');
      }

      throw new Error(responseMessage);
    }

    return res.json();
  } catch (error: any) {
    throw new Error(error.message || 'An unexpected error occurred');
  }
}
