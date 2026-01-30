import axiosInstance from '@/lib/axios';
import type { UpdateProfileRequest } from '@/schemas/user.schema';

export const userService = {
  updateProfile: async (data: UpdateProfileRequest, imageFile: File | null) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key as keyof UpdateProfileRequest];
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    if (imageFile) {
      formData.append('file', imageFile);
    }

    const res = await axiosInstance.patch('/user/edit-info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Quan trọng để Axios biết đây là FormData
      },
    });
    return res.data;
  },
};
