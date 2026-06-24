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

  // Bước 1: Gửi OTP về email khi đăng ký
  sendRegisterOtp: async (payload: {
    email: string;
    userName: string;
  }) => {
    const res = await apiClient.post('/auth/register/send-otp', payload);
    return res.data?.data ?? res.data;
  },

  // Bước 2: Xác thực OTP
  verifyRegisterOtp: async (payload: {
    email: string;
    otp: string;
  }) => {
    const res = await apiClient.post('/auth/register/verify-otp', payload);
    return res.data?.data ?? res.data;
  },

  // Bước 3: Sau khi OTP đúng thì tạo tài khoản
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
    // /login route không tồn tại trong App.tsx, redirect an toàn về /home để UI hiển thị lại AuthModal
    window.location.href = '/home';
  },
};


