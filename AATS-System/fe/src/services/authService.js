// Authentication Service
import api from './api.js';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      // BE Register returns { ok, user }, not token
      const regRes = await api.post('/auth/register', userData);

      // Auto-login after successful register
      if (userData?.email && userData?.password) {
        const loginRes = await api.post('/auth/login', {
          email: userData.email,
          password: userData.password,
        });
        if (loginRes?.token) {
          localStorage.setItem('auth_token', loginRes.token);
          localStorage.setItem('user_data', JSON.stringify(loginRes.user));
        }
      }

      return regRes;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      // api interceptor returns response.data directly
      const res = await api.post('/auth/login', credentials);
      if (res?.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_data', JSON.stringify(res.user));
      }
      return res;
    } catch (error) {
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const res = await api.get('/auth/me');
      // Update stored user data
      if (res?.user) {
        localStorage.setItem('user_data', JSON.stringify(res.user));
      }
      return res;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  },

  // Get stored user data
  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Get user role
  getUserRole() {
    const userData = this.getUserData();
    return userData?.role || null;
  },

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  },

  // Check if user is candidate
  isCandidate() {
    return this.hasRole('candidate');
  },

  // Check if user is HR
  isHR() {
    return this.hasRole('hr');
  },

  // Check if user is HM
  isHM() {
    return this.hasRole('hm');
  }
};
