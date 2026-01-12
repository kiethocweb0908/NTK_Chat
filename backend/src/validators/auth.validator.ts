import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .min(6);

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Tên bắt buộc phải có').trim(),
  lastName: z.string().min(1, 'Họ bắt buộc phải có').trim(),
  userName: z.string().min(6, 'Tên đăng nhập phải có ít nhất 6 ký tự'),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    // .regex(/[a-z]/, 'Phải có ít nhất 1 chữ cái thường')
    .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ cái in hoa')
    .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số')
    .regex(/[^a-zA-Z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt'),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(6, 'Vui lòng nhập Email hoặc Username'),
  password: z.string().trim().min(1, 'Vui lòng nhập mật khẩu'),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
