import Logout from '@/components/auth/Logout';
import { useAuthStore } from '@/stores/useAuthStore';

function ChatAppPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <div>
      {user?.displayName} <Logout />
    </div>
  );
}

export default ChatAppPage;
