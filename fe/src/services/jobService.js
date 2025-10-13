// Job Service
import api from './api.js';
import { mockJobs } from '../data/mockData';
import { adaptJobFromBE } from './jobsAdapter';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const jobService = {
  // Get all jobs with optional filters
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/jobs?${queryString}` : '/jobs';
      
      if (USE_MOCK) {
        // return FE mock structure
        return { data: mockJobs, meta: { page: 1, pageSize: mockJobs.length, total: mockJobs.length } };
      }
      const response = await api.get(url);
      // adapt BE jobs to FE shape if necessary
      if (response && response.data) {
        const adapted = response.data.map(adaptJobFromBE);
        return { data: adapted, meta: response.meta };
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single job by ID
  async getJob(jobId) {
    try {
      if (USE_MOCK) {
        const m = mockJobs.find(j => j.id === jobId);
        return { data: m };
      }
      const response = await api.get(`/jobs/${jobId}`);
      if (response && response.data) {
        return { data: adaptJobFromBE(response.data) };
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new job (HR only)
  async createJob(jobData) {
    try {
      const response = await api.post('/jobs', jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update job (HR only)
  async updateJob(jobId, jobData) {
    try {
      const response = await api.put(`/jobs/${jobId}`, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update job status (HR only)
  async updateJobStatus(jobId, status) {
    try {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete job (HR only)
  async deleteJob(jobId) {
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search jobs
  async searchJobs(searchTerm, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: searchTerm
      };
      
      return await this.getJobs(searchFilters);
    } catch (error) {
      throw error;
    }
  }
};