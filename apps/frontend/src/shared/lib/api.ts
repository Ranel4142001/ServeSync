import axios from 'axios';

// Create a single axios instance used across the entire app
// All API calls go through here — never create axios directly
const api = axios.create({
  // reads from .env file — points to our Fastify backend
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────
// This runs BEFORE every request is sent
// It automatically attaches the JWT token to every request
// So you never have to manually add Authorization header
api.interceptors.request.use((config) => {

  // Get the token from localStorage
  // We store it there after login
  const token = localStorage.getItem('accessToken');

  if (token) {
    // Attach token to every outgoing request
    // Backend rbac.middleware.ts reads this header
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response Interceptor ─────────────────────────────────
// This runs AFTER every response comes back
// If the server returns 401 (Unauthorized) it means
// the token expired — automatically redirect to login
api.interceptors.response.use(
  // Success — just return the response as is
  (response) => response,

  // Error — check if it is a 401
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Clear stored token and redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;