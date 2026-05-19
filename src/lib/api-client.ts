import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const trimmed = rawApiUrl.replace(/\/$/, '');
const API_BASE = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação se existir
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Emit an event instead of forcing navigation so HMR/react-refresh
      // doesn't get interrupted and we avoid full-page reload loops.
      localStorage.removeItem('authToken');
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        } catch (e) {
          // fallback: gently replace location without adding history entry
          window.location.replace('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
