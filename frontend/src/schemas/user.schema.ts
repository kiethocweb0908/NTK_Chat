import { z } from 'zod';

const displayName = z
  .string()
  .trim() // Xóa khoảng trắng thừa
  .refine((val) => val === '' || (val.length >= 2 && val.length <= 50), {
    message: 'Tên phải từ 2 đến 50 ký tự (hoặc để trống)',
  })
  .optional()
  .or(z.literal('')); // Chấp nhận chuỗi rỗng

const bio = z
  .string()
  .trim()
  .max(160, 'Tiểu sử không được vượt quá 160 ký tự')
  .optional()
  .or(z.literal(''));

// Gộp chung vào một Schema cho Profile
export const updateProfileSchema = z.object({
  displayName: displayName,
  bio: bio,
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
