// User Service
import api from './api.js';

export const userService = {
  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data));
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics (dashboard data)
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Export all services
export { authService } from './authService.js';
export { jobService } from './jobService.js';
export { applicationService } from './applicationService.js';