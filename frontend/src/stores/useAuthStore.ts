import { create } from 'zustand';
import { authService } from '@/services/authService';
import type { IAuthStore } from '@/types/stores';

export const useAuthStore = create<IAuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  signUp: async (data) => {
    try {
      set({ loading: true });
      // gọi api
      const res = await authService.signUp(data);
      return res;
    } catch (error: any) {
      // const errorMsg = error.response?.data?.message || 'Đăng ký không thành công';
      // toast.error(errorMsg);
      console.error('Store SignUp Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (data) => {
    try {
      set({ loading: true });

      const res = await authService.signIn(data);
      get().setAccessToken(res.accessToken);
      await get().fetchMe();
      return res.message;
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
}));
