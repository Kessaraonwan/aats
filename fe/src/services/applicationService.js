// Application Service
import api from './api.js';
import { mockApplications } from '../data/mockData';
import { jobService } from './jobService';

// Use mock data when VITE_USE_MOCK=true or when running in development mode
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.MODE === 'development';

function tryParseDataField(app) {
  if (!app) return app;
  try {
    let parsed = app.data;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (_) {
        // leave as string if not valid JSON
      }
    }

    // attach parsed object back to app.data
    app.data = parsed;

    // if parsed is an object, merge fields to top-level when not present
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.entries(parsed).forEach(([k, v]) => {
        if (app[k] === undefined) app[k] = v;
      });
    }
  } catch (e) {
    // ignore parse errors
    console.warn('failed to normalize application.data', e);
  }
  return app;
}

// simple in-memory cache for jobs map
let jobsCache = null;
async function getJobsMap() {
  if (jobsCache) return jobsCache;
  try {
    if (USE_MOCK) {
      // import mockJobs dynamically
      const { mockJobs } = await import('../data/mockData.js');
      jobsCache = Object.fromEntries(mockJobs.map(j => [j.id, j]));
      try {
        // eslint-disable-next-line no-console
        console.debug('[applicationService] getJobsMap - loaded mockJobs, count=', mockJobs.length);
      } catch (e) {}
      return jobsCache;
    }
    const resp = await jobService.getJobs(); // { data, meta }
    const jobs = resp?.data || [];
    jobsCache = Object.fromEntries(jobs.map(j => [j.id, j]));
    return jobsCache;
  } catch (e) {
    return {};
  }
}

function enrichWithJob(app, jobsMap) {
  if (!app) return app;
  const jobId = app.job_id || app.jobId || (app.data && app.data.job_id) || (app.data && app.data.jobId);
  if (jobId && jobsMap && jobsMap[jobId]) {
    app.jobTitle = app.jobTitle || jobsMap[jobId].title || jobsMap[jobId].name;
    app.job = app.job || jobsMap[jobId];
  }
  return app;
}

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
      
      if (USE_MOCK) {
        // clone and normalize mockApplications
        const cloned = mockApplications.map(a => tryParseDataField(JSON.parse(JSON.stringify(a))));
        // debug log to help identify that mock data is being used
        try {
          // eslint-disable-next-line no-console
          console.debug('[applicationService] getApplications - returning mock data, count=', cloned.length, 'filters=', filters);
        } catch (e) {}
        return { data: cloned, meta: { page: 1, pageSize: cloned.length, total: cloned.length } };
      }

      const response = await api.get(url); // response is expected to be { data, meta }

      // normalize returned items when structure is { data: [...] }
      if (response && Array.isArray(response.data)) {
        response.data = response.data.map(app => tryParseDataField(app));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single application by ID
  async getApplication(applicationId) {
    try {
      if (USE_MOCK) {
        const m = mockApplications.find(a => a.id === applicationId);
        return { data: tryParseDataField(m) };
      }
      const response = await api.get(`/applications/${applicationId}`);
      if (response && response.data) response.data = tryParseDataField(response.data);
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
      if (USE_MOCK) {
        const cloned = mockApplications.map(a => tryParseDataField(JSON.parse(JSON.stringify(a))));
        return { data: cloned };
      }
      const response = await api.get('/applications/my');
      if (response && Array.isArray(response.data)) {
        response.data = response.data.map(a => tryParseDataField(a));
      }
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