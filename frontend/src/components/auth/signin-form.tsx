import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Eye, UserRound, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { type SignInFormValues, signInSchema } from '@/schemas/auth.schema';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router';

function SigninpForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isChecked, setIsChecked] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignInFormValues) => {
    toast.promise(signIn(data), {
      loading: 'Đang xử lý đăng nhập...',
      success: (res) => {
        navigate('/');
        return res || 'Đăng nhập thành công!';
      },
      error: (err) => {
        return err.response?.data?.message || 'Đăng nhập thất bại';
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
                <h1 className="text-2xl font-bold ">Đăng nhập</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Nhập thông tin của bạn bên dưới để tiến hành đăng nhập.
                </p>
              </div>

              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="identifier" className="block text-sm">
                  Tên đăng nhập/Email
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="identifier"
                    {...register('identifier')}
                    className="pl-9"
                    autoComplete="identifier"
                  />
                  <UserRound className="size-4 absolute top-1/2 -translate-y-1/2 left-2 text-muted-foreground" />
                </div>
                {/* error message */}
                {errors.identifier && (
                  <p className="text-destructive">{errors.identifier.message}</p>
                )}
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

              <div className="flex gap-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => setIsChecked((prev) => !prev)}
                  id="check"
                />
                <label htmlFor="check" className="text-sm select-none">
                  Hiện mật khẩu
                </label>
              </div>

              {/* button submit */}
              <Button
                variant="default"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                Đăng nhập
              </Button>

              <div className="text-center text-sm *:[a]:hover:text-primary text-muted-foreground">
                Chưa có tài khoản?{' '}
                <a href="/register" className="underline underline-offset-4">
                  Đăng ký
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full  object-cover dark:brightness-[0.75] "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SigninpForm;
