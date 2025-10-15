import api from './api.js';

export const notificationService = {
  async getAggregated({ userId, limit = 50 } = {}) {
    const q = new URLSearchParams();
    if (userId) q.append('user_id', userId);
    if (limit) q.append('limit', String(limit));
    const res = await api.get(`/notifications/aggregate?${q.toString()}`);
    return res?.notifications || res?.data || [];
  }
};

export default notificationService;
