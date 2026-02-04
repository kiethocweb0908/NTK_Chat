import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordType } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/useAuthStore';
import { Link, useNavigate } from 'react-router';

function ForgotFrom({ className, ...props }: React.ComponentProps<'div'>) {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'all',
  });

  const onSubmit = async (data: ForgotPasswordType) => {
    toast.promise(forgotPassword(data.email), {
      loading: 'Đang xử lý...',
      success: (res) => {
        navigate('/verify-otp');
        return res || 'Mã OTP đã được gửi vào email của bạn';
      },
      error: (err) => {
        return err.response?.data?.message || 'Hành động thất bạii';
      },
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/iconWeb.jpeg" alt="logo" className="h-15 w-15" />
                </a>
                <h1 className="text-2xl font-bold ">Quên mật khẩu</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Nhập email đăng ký để khôi phục mật khẩu.
                </p>
              </div>

              {/* username */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Input
                    type="text"
                    id="identifier"
                    {...register('email')}
                    className="pl-9"
                    autoComplete="identifier"
                    placeholder="Nhập email của bạn"
                  />
                  <Mail className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                </div>
                {/* error message */}
                {errors.email && (
                  <p className="text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* button submit */}
              <Button variant="sent" type="submit" disabled={isSubmitting}>
                Xác nhận
              </Button>

              <div className="text-center text-sm *:[a]:hover:text-primary text-muted-foreground">
                <Link to="/login" className="underline underline-offset-4">
                  Đăng nhập
                </Link>
                {' / '}
                <Link to="/register" className="underline underline-offset-4">
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/forgot.webp"
              alt="Image"
              className="absolute inset-0 h-full w-full  object-cover object-[50%_40%]  dark:brightness-[0.75] "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotFrom;
