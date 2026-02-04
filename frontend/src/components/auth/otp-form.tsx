import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export function OTPForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const loading = useAuthStore((s) => s.loading);
  const verifyOTPRegister = useAuthStore((s) => s.verifyOTPRegister);
  const verifyOTPforgotPassword = useAuthStore((s) => s.verifyOTPforgotPassword);
  const resendOTP = useAuthStore((s) => s.resendOTP);
  const tempEmail = useAuthStore((s) => s.tempEmail);
  const type = useAuthStore((s) => s.authType);

  const navigate = useNavigate();

  // Tự động đếm ngược
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Vui lòng nhập đủ 6 số');
    if (!tempEmail) return toast.error('Thiếu thông tin email, vui lòng đăng ký lại');

    const verifyAction =
      type === 'REGISTER'
        ? verifyOTPRegister({ email: tempEmail, otp })
        : verifyOTPforgotPassword({ email: tempEmail, otp });

    toast.promise(verifyAction, {
      loading: 'Đang xác minh...',
      success: () => {
        if (type === 'FORGOT_PASSWORD') {
          navigate('/reset-password', { replace: true });
        }
        return 'Xác thực thành công!';
      },
      error: (err) => err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn',
    });
  };

  const handleResend = async () => {
    if (!tempEmail) return;
    setCountdown(60); // Reset đồng hồ
    toast.promise(resendOTP({ email: tempEmail, type: type! }), {
      loading: 'Đang gửi lại mã...',
      success: 'Đã gửi mã mới vào email của bạn!',
      error: (err) => err.response?.data?.message || 'Gửi lại mã thất bại',
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="flex-1 overflow-hidden p-0">
        <CardContent className="grid flex-1 p-0 md:grid-cols-2">
          <form
            onSubmit={handleVerify}
            className="flex flex-col items-center justify-center p-6 md:p-8"
          >
            <FieldGroup>
              <Field className="items-center text-center">
                <div className="w-fit text-center">
                  <img src="/iconWeb.jpeg" alt="logo" className="mx-auto h-15 w-15" />
                </div>
                <h1 className="text-2xl font-bold">Nhập mã xác minh</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Chúng tôi đã gửi mã OTP đến email {tempEmail}
                </p>
              </Field>
              <Field>
                <FieldLabel htmlFor="otp" className="sr-only">
                  Verification code
                </FieldLabel>
                <div className="flex justify-center w-full py-4">
                  <InputOTP
                    maxLength={6}
                    id="otp"
                    // required
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    containerClassName="gap-2 md:gap-3" // Khoảng cách giữa các ô giống ảnh 2
                  >
                    {/* Để các Slot đứng riêng lẻ để tạo hiệu ứng từng ô rời nhau */}
                    <InputOTPSlot
                      index={0}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                    <InputOTPSlot
                      index={1}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                    <InputOTPSlot
                      index={2}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                    <InputOTPSlot
                      index={3}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                    <InputOTPSlot
                      index={4}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                    <InputOTPSlot
                      index={5}
                      className="rounded-md border-muted-foreground/40 h-12 w-10 md:h-14 md:w-12"
                    />
                  </InputOTP>
                </div>
                <FieldDescription className="text-center">
                  Nhập mã 6 chữ số được gửi đến email của bạn
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" variant={'sent'} disabled={loading}>
                  {loading ? 'Đang xác minh...' : 'Xác minh'}
                </Button>
                <FieldDescription className="text-center">
                  Không nhận được mã?{' '}
                  <Button
                    type="button"
                    variant={'link'}
                    className="px-0 underline"
                    disabled={countdown > 0}
                    onClick={handleResend}
                  >
                    Gửi lại
                  </Button>
                </FieldDescription>

                <FieldDescription className="text-center">
                  <Link
                    to="/login"
                    className="px-0 underline text-muted-foreground flex items-center gap-1 w-fit mx-auto"
                  >
                    <ArrowLeft className="size-4" />
                    Quay lại đăng nhập
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/otp.webp"
              alt="Image"
              className="absolute inset-0 h-full w-full  object-cover dark:brightness-[0.75] "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
