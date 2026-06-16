import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
  headers: { 'Content-Type': 'application/json' },
};

=======
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
};

=======
  baseURL: 'http://localhost:5000/api',
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
<<<<<<< HEAD
    const status = err.response?.status;
    const reqUrl = err.config?.url || '';
    const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register');

    // For auth endpoints (login/register) we want the calling code to handle 401s
    // so the UI can show inline messages. Only perform a global redirect for
    // 401 responses from other endpoints.
    if (status === 401 && !isAuthEndpoint) {
=======
    if (err.response?.status === 401) {
>>>>>>> 74fd9038b4822c2d3d861cf9845199c9494fdece
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;
