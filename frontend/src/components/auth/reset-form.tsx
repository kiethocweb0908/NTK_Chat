import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/useAuthStore';
import { Link, useNavigate } from 'react-router';
import { Checkbox } from '../ui/checkbox';
import { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Eye, EyeOff } from 'lucide-react';

function ResetForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isChecked, setIsChecked] = useState(false);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const resetToken = useAuthStore((state) => state.resetToken);
  const tempEmail = useAuthStore((state) => state.tempEmail);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tempEmail || !resetToken) {
      navigate('/', { replace: true });
    }
  }, [tempEmail, resetToken]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: 'all',
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!tempEmail || !resetToken) {
      toast.error('Phiên làm việc đã hết hạn');
      return;
    }

    toast.promise(
      resetPassword({
        email: tempEmail,
        password: data.password,
        resetToken: resetToken,
      }),
      {
        loading: 'Đang xử lý...',
        success: (res) => {
          return res || 'Đổi mật khẩu thành công';
        },
        error: (err) => {
          return err.response?.data?.message || 'Hành động thất bạii';
        },
      }
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-fit text-center">
                  <img src="/iconWeb.jpeg" alt="logo" className="mx-auto h-15 w-15" />
                </div>
                <h1 className="text-2xl font-bold ">Đặt lại mật khẩu</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Đặt lại mật khẩu mới cho tài khoản ${tempEmail}.
                </p>
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    type={!isChecked ? 'password' : 'text'}
                    id="password"
                    {...register('password')}
                    placeholder="Đặt mật khẩu mới"
                    className="pl-9"
                    autoComplete="current-password"
                  />
                  {isChecked ? (
                    <Eye className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                  ) : (
                    <EyeOff className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                  )}
                </div>
                {/* error message */}
                {errors.password && (
                  <p className="text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* comfirmPassword */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="confirmPassword" className="block text-sm">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    type={!isChecked ? 'password' : 'text'}
                    id="confirmPassword"
                    className="pl-9"
                    {...register('confirmPassword')}
                    autoComplete="new-password"
                  />
                  {isChecked ? (
                    <Eye className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                  ) : (
                    <EyeOff className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                  )}
                </div>

                {/* error message */}
                {errors.confirmPassword && (
                  <p className="text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => setIsChecked((prev) => !prev)}
                  className="rounded-full"
                />
                <label className="text-sm select-none">Hiện mật khẩu</label>
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
              src="/reset.webp"
              alt="Image"
              className="absolute inset-0 h-full w-full  object-cover object-[50%_40%]  dark:brightness-[0.75] "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetForm;
