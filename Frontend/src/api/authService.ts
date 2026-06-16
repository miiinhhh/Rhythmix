import apiClient from './apiClient';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);

    // Expected (from backend): { success, data: { token, user: { id, userName } } }
    const data = res.data?.data ?? res.data;

    const token = data?.token ?? res.data?.token;
    const userId = data?.id ?? data?.user?.id;
    const userName = data?.userName ?? data?.user?.userName;

    if (token) localStorage.setItem('token', token);
    if (userId) localStorage.setItem('currentUserId', userId);
    if (userName) localStorage.setItem('currentUserName', userName);

    return data;
  },

  register: async (payload: {
    email: string;
    userName: string;
    password: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    const res = await apiClient.post('/auth/register', payload);
    // backend: { success: true, data: <result> }
    return res.data?.data ?? res.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    }

    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    window.location.href = '/login';
  },
};


