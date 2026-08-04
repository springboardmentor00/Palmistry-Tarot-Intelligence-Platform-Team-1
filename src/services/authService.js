import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async oauthLogin(provider, code, redirectUri) {
    const response = await api.post('/api/auth/oauth', { provider, code, redirect_uri: redirectUri });
    const data = response.data;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword, new_password: newPassword, confirm_new_password: newPassword,
    });
    return response.data;
  },
  async refreshToken(refreshToken) {
  const response = await api.post('/api/auth/refresh', {
    refresh_token: refreshToken,
  });

  return response.data;
},

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};