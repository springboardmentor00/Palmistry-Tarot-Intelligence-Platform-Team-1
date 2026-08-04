import api from './api';

export const profileService = {
  async createProfile(profileData) {
    const response = await api.post('/api/profile/', profileData);
    return response.data;
  },
  async getProfile() {
    const response = await api.get('/api/profile/');
    return response.data;
  },
  async updateProfile(profileData) {
    const response = await api.put('/api/profile/', profileData);
    return response.data;
  },
  async getReadingHistory(skip = 0, limit = 20) {
    const response = await api.get('/api/profile/reading-history', { params: { skip, limit } });
    return response.data;
  },
  async getReadingStats() {
    const response = await api.get('/api/profile/reading-stats');
    return response.data;
  },
  async getInterestOptions() {
    const response = await api.get('/api/profile/interests/options');
    return response.data;
  },
  async updateUserInfo(data) {
    const response = await api.put('/api/users/me', null, { params: data });
    return response.data;
  },
};