import axios from 'axios';
import { store, persistor } from '@store/index';
import { logout, setTokens } from '@store/slices/authSlice';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor ────────────────────────────────────────────────────────
// Injects Bearer token and tenant ID into every outgoing request.
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  const tenantId = state.auth.tenantId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});

// ── Response interceptor — silent token refresh on 401 ────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't intercept 401s from auth endpoints themselves (login, refresh)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // If a refresh is already in flight, queue this request and wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use same BASE_URL so the URL resolves correctly in all environments.
        // Plain axios (not `api`) avoids triggering this interceptor recursively.
        const { data } = await axios.post('/auth/refresh', {}, {
          baseURL: BASE_URL,
          withCredentials: true,
        });

        const { accessToken, refreshToken } = data.data;
        store.dispatch(setTokens({ accessToken, refreshToken }));
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear Redux state AND purge persisted localStorage so stale tokens
        // don't cause "Invalid or expired refresh token" on next page load.
        store.dispatch(logout());
        persistor.purge();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
