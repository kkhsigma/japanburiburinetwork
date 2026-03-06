import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach device ID for anonymous user tracking
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('jbn_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('jbn_device_id', deviceId);
    }
    config.headers['X-Device-Id'] = deviceId;
  }
  return config;
});

// Response interceptor: normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error(
        `[JBN API] ${error.response.status}: ${error.config?.url}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[JBN API] Network error — no response received');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
