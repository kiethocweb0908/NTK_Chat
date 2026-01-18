import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import type { IParticipant } from '@/types/chat';
import { Fragment, useEffect, useRef } from 'react';
import { getChatTimestampLabel } from '@/lib/utils';

const ChatWindowBody = () => {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const AllMessages = useChatStore((s) => s.messages);

  const messages = AllMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);

  if (!selectedConvo) return <ChatWelcomeScreen />;

  if (!messages?.length) {
    return <div>Chưa có tin nhắn nào trong cuộc trò chuyện này</div>;
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
    }
  };

  // cuộn đến cuối khi mở mới
  useEffect(() => {
    scrollToBottom('auto');
  }, [activeConversationId]);

  // Cuộn khi có tin mới
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const TIME_GAP_LIMIT = 5 * 60 * 1000;

          const isGroupBreak =
            index === 0 ||
            message.senderId !== prev?.senderId ||
            new Date(message.createdAt).getTime() -
              new Date(prev?.createdAt || 0).getTime() >
              TIME_GAP_LIMIT;

          const isEndOfGroup =
            !next ||
            next.senderId !== message.senderId ||
            new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() >
              TIME_GAP_LIMIT;

          const isGroup = selectedConvo.type === 'group';

          const isLastMessage = message._id === selectedConvo.lastMessage?._id;

          const participant = selectedConvo.participants.find(
            (p: IParticipant) => p._id.toString() === message.senderId.toString()
          );

          const isNewDay =
            index === 0 ||
            new Date(message.createdAt).toDateString() !==
              new Date(prev?.createdAt).toDateString();

          return (
            <Fragment key={message._id ?? index}>
              {/* Nếu là ngày mới, hiển thị nhãn thời gian ở giữa */}
              {isNewDay && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-muted-foreground">
                    {getChatTimestampLabel(new Date(message.createdAt))}
                  </span>
                </div>
              )}

              <MessageItem
                message={message}
                isGroupBreak={isGroupBreak}
                isEndOfGroup={isEndOfGroup}
                isGroup={isGroup}
                isLastMessage={isLastMessage}
                senderName={participant?.displayName} // Truyền String
                senderAvatar={participant?.avatarUrl} // Truyền String
                lastMessageStatus="delivered"
              />
            </Fragment>
          );
        })}
        <div ref={scrollRef} className="h-0 w-0" />;
      </div>
    </div>
  );
};

export default ChatWindowBody;
