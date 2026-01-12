import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const Logout = () => {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleLogout = async () => {
    toast.promise(signOut(), {
      loading: 'Đang xử lý đăng đăng xuất...',
      success: () => {
        navigate('/login');
        return 'Đăng xuất thành công!';
      },
      error: (err) => {
        return err.response?.data?.message || 'Đăng nhập thất bại';
      },
    });
  };

  return <Button onClick={handleLogout}>Đăng xuất</Button>;
};

export default Logout;
