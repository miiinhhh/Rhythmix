import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5269/api',
  headers: { 'Content-Type': 'application/json' },
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Không redirect sang route không tồn tại (tránh lỗi UI kiểu 404/Unexpected Application Error).
    // Chỉ xóa token khi bị 401 và để caller (AuthModal) tự hiển thị thông báo nhập lại.
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default apiClient;

