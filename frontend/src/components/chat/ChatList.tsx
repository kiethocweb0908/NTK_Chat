import { useChatStore } from '@/stores/useChatStore';
import ChatCard from './ChatCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import UnreadCountBadge from './UnreadCountBadge';
import { useSidebar } from '@/components/ui/sidebar';
import UserAvatar from './UserAvatar';
import GroupChatAvatar from './GroupChatAvatar';
import { useSocketStore } from '@/stores/useSocketStore';

const ChatList = () => {
  const conversations = useChatStore((state) => state.conversations);
  const user = useAuthStore((s) => s.user);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const messages = useChatStore((s) => s.messages);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const onlineUsers = useSocketStore((s) => s.onlineUsers);

  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const visibleConversations = isCollapsed ? conversations.slice(0, 3) : conversations;

  if (!user) return null;

  if (!conversations.length) {
    return <p className="text-sm text-muted-foreground px-2">Chưa có cuộc trò chuyện</p>;
  }

  const handleSelectConversation = async (id: string) => {
    if (activeConversationId === id) {
      setActiveConversation(null);
    } else {
      setActiveConversation(id);
      if (!messages[id]) {
        // todo: fetch message
        await fetchMessages();
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {visibleConversations.map((convo) => {
        // 1. Tính toán logic cho từng card
        let name = '';
        let avatarUrl = null;
        let userId = '';

        if (convo.type === 'direct') {
          const otherUser = convo.participants.find((p) => p._id !== user._id);
          if (!otherUser) return null;

          name = otherUser.displayName ?? 'Người dùng';
          avatarUrl = otherUser.avatarUrl;
          userId = otherUser._id;
        }

        if (convo.type === 'group') {
          name = convo.group?.name ? `NHÓM: ${convo.group?.name}` : 'chưa có tên';
        }

        if (convo.type === 'self') {
          name = `Ghi chú: ${user.displayName}`;
          userId = user._id;
        }

        const convoId = convo._id;
        // const name = otherUser.displayName ?? 'Người dùng';
        const lastMessage = convo.lastMessage?.content ?? '';
        const timestamp = convo.lastMessageAt ? new Date(convo.lastMessageAt) : undefined;
        const isActive = activeConversationId === convo._id;
        const unreadCount = convo.unreadCounts[user._id];

        // 2. Render LeftSection (Avatar)
        const leftSection = (
          <>
            {convo.type === 'group' ? (
              <GroupChatAvatar participants={convo.participants} type="chat" />
            ) : (
              <>
                <UserAvatar type="chat" name={name || ''} avatarUrl={avatarUrl} />
                <StatusBadge
                  status={onlineUsers.includes(userId) ? 'online' : 'offline'}
                />
              </>
            )}
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          </>
        );

        // 3. Render Subtitle
        const subtitle = (
          <p
            className={cn(
              'text-xs truncate',
              unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
            )}
          >
            {convo.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
          </p>
        );

        return (
          <ChatCard
            key={convo._id}
            convoId={convoId}
            name={name}
            isActive={isActive}
            unreadCount={unreadCount}
            timestamp={timestamp}
            lastMessage={lastMessage}
            onSelect={handleSelectConversation}
            leftSection={leftSection}
            subtitle={subtitle}
          />
        );
      })}
    </div>
  );
};

export default ChatList;
