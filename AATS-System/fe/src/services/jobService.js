// Job Service
import api from './api.js';
import { adaptJobFromBE } from './jobsAdapter';

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
      
      const response = await api.get(url); // interceptor returns response.data
      // Expect BE: { ok, jobs }
      const jobs = response?.jobs || response?.data || [];
      const adapted = Array.isArray(jobs) ? jobs.map(adaptJobFromBE) : [];
      const meta = response?.meta || { page: response?.page, pageSize: response?.limit, total: response?.total };
      return { data: adapted, meta };
    } catch (error) {
      throw error;
    }
  },

  // Get single job by ID
  async getJob(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}`); // { ok, job }
      const job = response?.job || response?.data || null;
      return { data: job ? adaptJobFromBE(job) : null };
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
