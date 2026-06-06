import apiClient from './apiClient';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data.token) localStorage.setItem('token', res.data.token);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};