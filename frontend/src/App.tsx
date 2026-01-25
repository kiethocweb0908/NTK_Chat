import { BrowserRouter, Route, Routes } from 'react-router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatAppPage from './pages/ChatAppPage';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useThemeStore } from './stores/useThemeStore';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useSocketStore } from './stores/useSocketStore';
import { unlockAudio } from './lib/notificationSound';

function App() {
  const isDark = useThemeStore((state) => state.isDark);
  const setTheme = useThemeStore((state) => state.setTheme);
  const accessToken = useAuthStore((state) => state.accessToken);
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);

  // theme
  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  // kết nối socket
  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }

    return () => disconnectSocket();
  }, [accessToken]);

  // âm thanh
  useEffect(() => {
    const unlockEvents = ['click', 'touchstart', 'keydown'];

    const handler = () => {
      unlockAudio();
      unlockEvents.forEach((event) => window.removeEventListener(event, handler));
    };

    unlockEvents.forEach((event) => window.addEventListener(event, handler));

    return () => {
      unlockEvents.forEach((event) => window.removeEventListener(event, handler));
    };
  }, []);

  return (
    <>
      <Toaster richColors position="top-right" duration={2000} />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
