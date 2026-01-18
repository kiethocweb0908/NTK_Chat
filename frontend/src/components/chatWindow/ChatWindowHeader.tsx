import { useChatStore } from '@/stores/useChatStore';
import type { IConversation } from '@/types/chat';
import { SidebarTrigger } from '../ui/sidebar';
import { useAuthStore } from '@/stores/useAuthStore';
import { Separator } from '@radix-ui/react-separator';
import UserAvatar from '../chat/UserAvatar';
import StatusBadge from '../chat/StatusBadge';
import GroupChatAvatar from '../chat/GroupChatAvatar';
import { useSocketStore } from '@/stores/useSocketStore';

const ChatWindowHeader = ({ chat }: { chat?: IConversation }) => {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const user = useAuthStore((s) => s.user);
  const onlineUsers = useSocketStore((s) => s.onlineUsers);

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header
        className="md:hidden sticky top-0 z-10 
    flex items-center w-full
    gap-2 px-4 py-2"
      >
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  let name = '';
  let avatarUrl = null;
  let otherUserId = '';

  if (chat.type === 'direct') {
    const otherUser = chat.participants.find((p) => p._id !== user?._id);
    if (!user || !otherUser) return;

    name = otherUser.displayName ?? 'Người dùng';
    avatarUrl = otherUser.avatarUrl;
    otherUserId = otherUser._id;
  }

  if (chat.type === 'group') {
    name = chat.group?.name ? `NHÓM: ${chat.group?.name}` : 'chưa có tên';
  }

  if (chat.type === 'self') {
    name = 'Ghi chú của tôi';
    avatarUrl = chat.participants[0].avatarUrl;
    otherUserId = chat.participants[0]._id;
  }

  return (
    <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />

        <div className="p-2 w-full flex items-center gap-3">
          {/* avatar */}
          <div className="relative">
            {chat.type !== 'group' ? (
              <>
                <UserAvatar
                  type="header"
                  name={name}
                  avatarUrl={avatarUrl || undefined}
                />
                {/* todo: socket io */}
                <StatusBadge
                  status={onlineUsers.includes(otherUserId) ? 'online' : 'offline'}
                />
              </>
            ) : (
              <GroupChatAvatar participants={chat.participants} type="header" />
            )}
          </div>

          {/* name */}
          <h2 className="font-semibold text-foreground">{name}</h2>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
