import axiosInstance from '@/lib/axios';
import { type SignInFormValues, type SignUpApiRequest } from '@/schemas/auth.schema';

export const authService = {
  signUp: async (data: SignUpApiRequest) => {
    const res = await axiosInstance.post('/auth/register', data);
    return res.data;
  },
  signIn: async (data: SignInFormValues) => {
    const res = await axiosInstance.post('/auth/login', data);
    return res.data;
  },

  signOut: async () => {
    return await axiosInstance.post('/auth/logout');
  },

  fetchMe: async () => {
    const res = await axiosInstance.get('/user/me');
    return res.data;
  },

  refresh: async () => {
    const res = await axiosInstance.post('/auth/refresh');
    return res.data;
  },
};
