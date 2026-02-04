import { OTPForm } from '@/components/auth/otp-form';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const OtpPage = () => {
  const tempEmail = useAuthStore((s) => s.tempEmail);
  const authType = useAuthStore((s) => s.authType);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tempEmail || !authType) navigate('/');
  }, [tempEmail, authType, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <OTPForm />
      </div>
    </div>
  );
};

export default OtpPage;
