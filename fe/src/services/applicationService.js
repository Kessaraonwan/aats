// Application Service
import api from './api.js';

export const applicationService = {
  // Get all applications (filtered by role)
  async getApplications(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/applications?${queryString}` : '/applications';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single application by ID
  async getApplication(applicationId) {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new application (Candidate only)
  async createApplication(applicationData) {
    try {
      const response = await api.post('/applications', applicationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get my applications (Candidate only)
  async getMyApplications() {
    try {
      const response = await api.get('/applications/my');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update application status (HR only)
  async updateApplicationStatus(applicationId, status, description) {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status,
        description
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add note to application (HR/HM only)
  async addNote(applicationId, content) {
    try {
      const response = await api.post(`/applications/${applicationId}/notes`, {
        content
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create evaluation (HM only)
  async createEvaluation(applicationId, evaluationData) {
    try {
      const response = await api.post(`/applications/${applicationId}/evaluation`, evaluationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get applications by status
  async getApplicationsByStatus(status) {
    try {
      return await this.getApplications({ status });
    } catch (error) {
      throw error;
    }
  },

  // Get applications for specific job
  async getApplicationsForJob(jobId) {
    try {
      return await this.getApplications({ job_id: jobId });
    } catch (error) {
      throw error;
    }
  }
};