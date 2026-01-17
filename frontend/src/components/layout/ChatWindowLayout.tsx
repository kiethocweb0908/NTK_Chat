import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from '../chatWindow/ChatWelcomeScreen';
import ChatWindowSkeleton from '../chatWindow/ChatWindowSkeleton';
import { SidebarInset } from '../ui/sidebar';
import ChatWindowHeader from '../chatWindow/ChatWindowHeader';
import ChatWindowBody from '../chatWindow/ChatWindowBody';
import MessageInput from '../chatWindow/MessageInput';

const ChatWindowLayout = () => {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const messageLoading = useChatStore((s) => s.messageLoading);
  const messages = useChatStore((s) => s.messages);

  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  if (messageLoading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset
      className="felx flex-col h-full flex-1 overflow-hidden
    rounded-sm shadow-md"
    >
      {/* header */}
      <ChatWindowHeader />

      {/* body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>

      {/* footer */}
      <MessageInput />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
