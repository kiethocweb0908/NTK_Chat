import { SignupForm } from '@/components/auth/signup-form';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

function RegisterPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  );
}

export default RegisterPage;
