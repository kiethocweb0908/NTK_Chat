import axiosInstance from '@/lib/axios';
import {
  type ForgotPasswordType,
  type resendOTPType,
  type ResetPasswordType,
  type SignInFormValues,
  type SignUpApiRequest,
  type VerifyOTPType,
} from '@/schemas/auth.schema';

export const authService = {
  signUp: async (data: SignUpApiRequest) => {
    const res = await axiosInstance.post('/auth/register', data);
    return res.data;
  },

  resendOTP: async (data: resendOTPType) => {
    const res = await axiosInstance.post(`/auth/resend-otp`, data);
    return res.data.message;
  },

  verifyOTPRegister: async (data: VerifyOTPType) => {
    const res = await axiosInstance.post('/auth/verify-otp-register', data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordType) => {
    const res = await axiosInstance.post('/auth/forgot-password', data);
    return res.data;
  },

  verifyOTPforgotPassword: async (data: VerifyOTPType) => {
    const res = await axiosInstance.post('/auth/verify-otp-forgot', data);
    return res.data;
  },

  resetPassword: async (data: ResetPasswordType) => {
    const res = await axiosInstance.post('/auth/reset-password', data);
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
