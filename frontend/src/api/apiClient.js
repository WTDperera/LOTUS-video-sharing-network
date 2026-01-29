import axios from 'axios';
import { getToken, setToken, removeToken, isTokenExpired } from '../utils/auth';

// Base API configuration
// TODO: Move this to environment variables later
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // TODO: Implement actual refresh token logic when backend is ready
        // const refreshToken = getRefreshToken();
        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        // setToken(response.data.token);
        // return apiClient(originalRequest);
        
        // For now, just redirect to login
        removeToken();
        window.location.href = '/login';
      } catch (refreshError) {
        removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
