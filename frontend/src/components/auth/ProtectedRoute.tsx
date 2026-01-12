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

  const init = async () => {
    if (!accessToken) await refresh();
    if (accessToken && !user) await fetchMe();
    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">Đang tải trang...</div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;
