/**
 * Centralized API client for communicating with the LocalCommerce backend.
 * Uses native fetch and automatically injects authentication token when available.
 */

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';
export const TOKEN_STORAGE_KEY = 'localcommerce_token';

/**
 * Core HTTP request handler
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach stored JWT if available and not already provided
  if (!headers.Authorization && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    console.error('Network request failed:', networkError);
    throw new Error('Unable to connect to the server. Please check your connection or try again later.', {
      cause: networkError,
    });
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      (response.status === 401
        ? 'Authentication required or session expired.'
        : response.status === 403
        ? 'You do not have permission to perform this action.'
        : response.status === 404
        ? 'The requested resource was not found.'
        : `Request failed with status ${response.status}`);

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
