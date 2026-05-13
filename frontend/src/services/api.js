import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const roomsApi = {
  list: (params) => api.get('/rooms', { params }).then((r) => r.data),
  get: (id) => api.get(`/rooms/${id}`).then((r) => r.data),
  create: (data) => api.post('/rooms', data).then((r) => r.data),
  update: (id, data) => api.put(`/rooms/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/rooms/${id}`).then((r) => r.data),
};

export const bookingsApi = {
  create: (data) => api.post('/bookings', data).then((r) => r.data),
  mine: () => api.get('/bookings/me').then((r) => r.data),
  cancel: (id) => api.post(`/bookings/${id}/cancel`).then((r) => r.data),
  listAll: () => api.get('/bookings').then((r) => r.data),
  calendar: (start, end) =>
    api.get('/bookings/calendar', { params: { start, end } }).then((r) => r.data),
  setStatus: (id, status) =>
    api.put(`/bookings/${id}/status`, { status }).then((r) => r.data),
};

export const adminApi = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
};

export default api;
