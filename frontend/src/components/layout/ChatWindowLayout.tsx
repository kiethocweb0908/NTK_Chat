import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from '../chatWindow/ChatWelcomeScreen';
import ChatWindowSkeleton from '../chatWindow/ChatWindowSkeleton';
import { SidebarInset } from '../ui/sidebar';
import ChatWindowHeader from '../chatWindow/ChatWindowHeader';
import ChatWindowBody from '../chatWindow/ChatWindowBody';
import MessageInput from '../chatWindow/MessageInput';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

const ChatWindowLayout = () => {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const markAsSeen = useChatStore((s) => s.markAsSeen);
  const tempChatUser = useChatStore((s) => s.tempChatUser);

  // const messages = useChatStore((s) => s.messages);
  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  // useEffect(() => {
  //   if (!selectedConvo) return;

  //   const myId = useAuthStore.getState().user?._id;
  //   const hasUnread = selectedConvo.unreadCounts[myId!] > 0;

  //   if (!hasUnread) return;

  //   const markSeen = async () => {
  //     try {
  //       await markAsSeen();
  //     } catch (error) {
  //       console.error('Lỗi khi markSeen: ', error);
  //     }
  //   };
  //   markSeen();
  // }, [markAsSeen, selectedConvo]);

  const myId = useAuthStore((s) => s.user?._id);
  const unreadCount = selectedConvo?.unreadCounts?.[myId ?? ''] ?? 0;

  useEffect(() => {
    if (!activeConversationId) return;
    if (unreadCount === 0) return;

    markAsSeen();
  }, [activeConversationId, unreadCount, markAsSeen]);

  if (!selectedConvo && !tempChatUser) {
    return <ChatWelcomeScreen />;
  }

  return (
    <SidebarInset
      className="felx flex-col h-full flex-1 overflow-hidden
    rounded-sm shadow-md"
    >
      {/* header */}
      <ChatWindowHeader chat={selectedConvo} tempUser={tempChatUser} />

      {/* body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody isTemp={!!tempChatUser} />
      </div>

      {/* footer */}
      <MessageInput selectedConvo={selectedConvo} tempUser={tempChatUser} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
