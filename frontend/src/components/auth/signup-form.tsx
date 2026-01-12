import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { type SignUpFormValues, signUpFormSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isChecked, setIsChecked] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { confirmPassword, ...dataToSubmit } = data;
    toast.promise(signUp(dataToSubmit), {
      loading: 'Đang xử lý đăng ký...',
      success: (res) => {
        navigate('/login');
        return res?.message || 'Đăng ký thành công!';
      },
      error: (err) => {
        // Chạy khi API lỗi
        return err.response?.data?.message || 'Đăng ký thất bại';
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
                {/* <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/iconWeb.jpeg" alt="logo" className="h-15 w-15" />
                </a> */}
                <h1 className="text-2xl font-bold ">Đăng ký tài khoản</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Nhập email của bạn bên dưới để đăng ký tài khoản.
                </p>
              </div>

              {/* họ tên */}
              <div className="grid grid-cols-2 gap-3">
                {/* họ */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="block text-sm">
                    Họ
                  </Label>
                  <Input type="text" id="lastName" {...register('lastName')} />
                  {/* error message */}
                  {errors.lastName && (
                    <p className="text-destructive">{errors.lastName.message}</p>
                  )}
                </div>

                {/* tên */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="block text-sm">
                    Tên
                  </Label>
                  <Input type="text" id="firstName" {...register('firstName')} />
                  {/* error message */}
                  {errors.firstName && (
                    <p className="text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
              </div>

              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="userName" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="userName"
                  {...register('userName')}
                  autoComplete="userName"
                />
                {/* error message */}
                {errors.userName && (
                  <p className="text-destructive">{errors.userName.message}</p>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="m@gmail.com"
                  {...register('email')}
                  autoComplete="email"
                />
                {/* error message */}
                {errors.email && (
                  <p className="text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  type={!isChecked ? 'password' : 'text'}
                  id="password"
                  {...register('password')}
                  autoComplete="new-password"
                />
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
                <Input
                  type={!isChecked ? 'password' : 'text'}
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  autoComplete="new-password"
                />
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
              <Button
                variant="secondary"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm *:[a]:hover:text-primary text-muted-foreground">
                Đã có tài khoản?{' '}
                <a href="/login" className="underline underline-offset-4">
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/register.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full  object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
