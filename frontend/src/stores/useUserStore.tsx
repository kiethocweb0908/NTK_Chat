import { userService } from '@/services/userService';
import type { IuseUserState } from '@/types/stores';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

export const useUserStore = create<IuseUserState>((set, get) => ({
  isUpdating: false,
  imageFile: null,
  setImageFile: (file) => {
    set({
      imageFile: file,
    });
  },
  clearImageFile: () => {
    set({ imageFile: null });
  },
  updateProfile: async (profileData) => {
    const { imageFile } = get();
    if (!imageFile && Object.keys(profileData).length === 0) return;
    set({ isUpdating: true });
    try {
      const res = await userService.updateProfile(profileData, imageFile);
      useAuthStore.setState({
        user: res.updatedUser,
      });
      set({ imageFile: null });
      return res.message;
    } catch (error: any) {
      console.error('error updateProfile: ', error);
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },
}));
