import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:9000/api' : '/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originnalRequest = error.config;

    if (
      originnalRequest.url.includes('/auth/login') ||
      originnalRequest.url.includes('/auth/register') ||
      originnalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originnalRequest._retryCount = originnalRequest._retryCount || 0;

    if (error.response?.status === 401 && originnalRequest._retryCount < 4) {
      originnalRequest._retryCount += 1;
      try {
        const res = await axiosInstance.post('auth/refresh');
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originnalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originnalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
