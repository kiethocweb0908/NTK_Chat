import { z } from 'zod';

// Định nghĩa các trường dùng chung
const emailValidator = z.string().email('Email không đúng định dạng');

const passwordValidator = z
  .string()
  .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
  .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ cái in hoa')
  .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số')
  .regex(/[^a-zA-Z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt');

const otpValidator = z
  .string()
  .length(6, 'Mã OTP phải có đúng 6 ký tự')
  .regex(/^\d+$/, 'Mã OTP chỉ được chứa chữ số');

const authTypeValidator = z.enum(['REGISTER', 'FORGOT_PASSWORD']);

export const authApiSchema = z.object({
  firstName: z.string().min(1, 'Tên bắt buộc phải có').trim(),
  lastName: z.string().min(1, 'Họ bắt buộc phải có').trim(),
  userName: z.string().min(6, 'Tên đăng nhập phải có ít nhất 6 ký tự'),
  email: emailValidator,
  password: passwordValidator,
});

export const signUpFormSchema = authApiSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  identifier: z.string().trim().min(6, 'Vui lòng nhập Email hoặc Username'),
  password: z.string().trim().min(1, 'Vui lòng nhập mật khẩu'),
});

export const verifyOTPValidator = z.object({
  email: emailValidator,
  otp: otpValidator,
});

export const forgotPasswordSchema = z.object({
  email: emailValidator,
});

// Schema cho trang nhập OTP (Dùng chung cho cả Register và Forgot)
export const verifyOtpSchema = z.object({
  email: emailValidator,
  otp: otpValidator,
});

export const resendOTPSchema = z.object({
  email: emailValidator,
  type: authTypeValidator,
});

// Schema cho trang đặt lại mật khẩu mới
export const resetPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  // Dùng lại logic password mạnh của Kiệt đã viết
  password: passwordValidator,
  resetToken: z.string().min(1, 'Mã xác nhận (Reset Token) không được để trống'),
});

export const resetPasswordFormSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

//==========SIGNUP
// gửi api
export type SignUpApiRequest = z.infer<typeof authApiSchema>;
export type VerifyOTPType = z.infer<typeof verifyOTPValidator>;
// form
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;

//==========SIGNIN
export type SignInFormValues = z.infer<typeof signInSchema>;

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpType = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;
export type resendOTPType = z.infer<typeof resendOTPSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
