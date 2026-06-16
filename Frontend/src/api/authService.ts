<<<<<<< HEAD
import apiClient from './apiClient';
import type { AuthResponse } from '../types/api';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    const authData = res.data.data;

    if (authData?.token) {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('currentUserId', authData.id);
      localStorage.setItem('currentUserName', authData.userName);
    }

    return authData;
  },

  register: async (payload: { email: string; password: string; name: string }) => {
    const request = {
      email: payload.email,
      userName: payload.name,
      password: payload.password,
      displayName: payload.name,
      bio: '',
      avatarUrl: '',
    };

    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', request);
    const authData = res.data.data;

    // Do NOT persist token on register - require explicit login after signing up

    return authData;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore logout failure on client side
    }

    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    window.location.reload();
  },
=======
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
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
};