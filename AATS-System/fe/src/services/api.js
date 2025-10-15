// API Configuration and Base Setup
import axios from 'axios';

// Base API URL - change this based on environment
// Default to BE on :8080 to match be_clean/.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - remove token and user data. Only force a full-page
      // redirect to the login route if there was an existing token and
      // the user is not already on the login page. This prevents the
      // app from bouncing away from the login form when credentials are
      // incorrect while preserving automatic logout behavior for expired
      // tokens during normal app usage.
      const hadToken = !!localStorage.getItem('auth_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      try {
        const isOnLogin = window.location.pathname === '/login' || window.location.pathname === '/';
        if (hadToken && !isOnLogin) {
          window.location.href = '/login';
        }
      } catch (e) {
        // window may not be available in some test environments - ignore
      }
    }
    
    // Return error message from server or default message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
