import ChatWindowLayout from '@/components/layout/ChatWindowLayout';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';

function ChatAppPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <SidebarProvider>
      <div className="relative z-20">
        <AppSidebar />
      </div>

      {/* khung chat */}
      <div className="flex h-screen w-full p-2">
        <ChatWindowLayout />
      </div>
    </SidebarProvider>
  );
}

export default ChatAppPage;
