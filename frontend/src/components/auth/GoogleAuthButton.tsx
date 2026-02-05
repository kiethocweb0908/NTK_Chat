import { useAuthStore } from '@/stores/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const GoogleAuthButton = () => {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: any) => {
    // Đây là cái mã JWT cực kỳ quan trọng từ Google gửi về
    // const token = jwtDecode(credentialResponse.credential);
    // console.log(token)
    const token = credentialResponse.credential;

    toast.promise(loginWithGoogle(token), {
      loading: 'Đang xác thực với Google...',
      success: (res) => {
        navigate('/'); // Đăng nhập xong thì về trang chủ
        return res;
      },
      error: (err) => err.response?.data?.message || 'Lỗi đăng nhập Google',
    });
  };

  const handleError = () => {
    console.log('Đăng nhập thất bại. Kiệt kiểm tra lại cấu hình nhé!');
  };

  return (
    <div className="my-4 flex justify-center w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline" // Hoặc "filled_blue" nếu muốn nổi bật
        shape="rectangular" // Hoặc "pill" cho nó bo tròn
        size="medium"
        text="signin_with" // Hiển thị chữ "Sign in with Google"
        // locale="vi" // Hiển thị tiếng Việt cho thân thiện
      />
    </div>
  );
};

export default GoogleAuthButton;
