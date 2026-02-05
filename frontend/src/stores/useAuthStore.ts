import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import type { IAuthStore } from '@/types/stores';
import { useChatStore } from './useChatStore';

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,
      tempEmail: null,
      resetToken: null,
      authType: null,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset();
        localStorage.clear();
        sessionStorage.clear();
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      signUp: async (data) => {
        try {
          get().clearState();
          set({ loading: true });
          // gọi api
          const res = await authService.signUp(data);
          set({ tempEmail: res.email, authType: 'REGISTER' });
          return res;
        } catch (error: any) {
          console.error('Store SignUp Error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      resendOTP: async (data) => {
        try {
          set({ loading: true });
          const message = await authService.resendOTP(data);
          return message;
        } catch (error) {
          console.error('resendOTP error: ', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      verifyOTPRegister: async (data) => {
        try {
          set({ loading: true });
          useChatStore.getState().reset();
          const res = await authService.verifyOTPRegister(data);
          const { message, user, accessToken } = res;
          // get().setAccessToken(res.accessToken);
          // await get().fetchMe();
          // useChatStore.getState().fetchConversations();
          set({ tempEmail: null, authType: null, user, accessToken });
          return message;
        } catch (error) {
          console.error('Store verifyOTP Error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ loading: true });
          const res = await authService.forgotPassword({ email });
          set({ tempEmail: email, authType: 'FORGOT_PASSWORD' });
          return res.message;
        } catch (error) {
          console.error('forgotPassword error: ', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      verifyOTPforgotPassword: async (data) => {
        try {
          set({ loading: true });
          const res = await authService.verifyOTPforgotPassword(data);
          set({ resetToken: res.resetToken });
          return res.message;
        } catch (error) {
          console.error('verifyOTPforgotPassword error: ', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      resetPassword: async (data) => {
        try {
          set({ loading: true });
          const res = await authService.resetPassword(data);
          set({
            user: res.user,
            accessToken: res.accessToken,
            tempEmail: null,
            resetToken: null,
            authType: null,
          });
          return res.message;
        } catch (error) {
          console.error('resetPassword error: ', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      loginWithGoogle: async (googleToken) => {
        try {
          set({ loading: true });
          const res = await authService.loginWithGoogle(googleToken);
          const { user, accessToken, message } = res;

          set({ user, accessToken });
          return message;
        } catch (error) {
          console.error('loginWithGoogle error: ', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (data) => {
        try {
          set({ loading: true });
          localStorage.clear();
          useChatStore.getState().reset();

          const res = await authService.signIn(data);
          const { user, accessToken, message } = res;
          set({ accessToken, user });
          // get().setAccessToken(res.accessToken);
          // await get().fetchMe();
          // useChatStore.getState().fetchConversations();
          return message;
        } catch (error) {
          console.error('Store signIn Error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
          get().clearState();
        } catch (error) {
          console.error('Store signOut Error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true });

          const res = await authService.fetchMe();
          set({ user: res.user });
        } catch (error) {
          console.error('Store fetchMe Error:', error);
          set({ user: null, accessToken: null });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe } = get();
          const res = await authService.refresh();
          get().setAccessToken(res.accessToken);

          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error('Store refresh Error:', error);
          get().clearState();
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, tempEmail: state.tempEmail }),
    }
  )
);
