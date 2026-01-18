import { useAuthStore } from '@/stores/useAuthStore';
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const refresh = useAuthStore((state) => state.refresh);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!accessToken && user) {
          await refresh();
        }

        if (accessToken && !user) {
          await fetchMe();
        }
      } catch (error) {
        console.log('Chưa đăng nhập hoặc phiên làm việc hết hạn');
      } finally {
        setStarting(false);
      }
    };

    checkAuth();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">Đang tải trang...</div>
    );
  }

  return accessToken ? <Outlet></Outlet> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
