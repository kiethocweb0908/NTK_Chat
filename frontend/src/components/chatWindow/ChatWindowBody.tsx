import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import type { IParticipant } from '@/types/chat';
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getChatTimestampLabel } from '@/lib/utils';
import InfiniteScroll from 'react-infinite-scroll-component';
import ChatWindowSkeleton from './ChatWindowSkeleton';

const ChatWindowBody = ({ isTemp }: { isTemp?: boolean }) => {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const conversations = useChatStore((s) => s.conversations);
  const allMessages = useChatStore((s) => s.messages);
  const messageLoading = useChatStore((s) => s.messageLoading);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const [lastMessageStatus, setLastMessageStatus] = useState<'delivered' | 'seen'>(
    'delivered'
  );

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);

  // ref
  const containerRef = useRef<HTMLDivElement>(null);
  const key = `chat-scroll-${activeConversationId}`;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: behavior,
      });
    }
  };
  // cuộn đến cuối khi mở mới
  // useLayoutEffect(() => {
  //   // scrollToBottom('auto');
  //   const container = containerRef.current;
  //   if (!container || !activeConversationId) return;
  //   requestAnimationFrame(() => {
  //     container.scrollTop = 0;
  //   });
  // }, [activeConversationId]);
  // Cuộn khi có tin mới
  useLayoutEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);
  // lưu vị trí
  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) return;
    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      })
    );
  };
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const item = sessionStorage.getItem(key);
    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);

  // đã xem
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) return;
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? 'seen' : 'delivered');
  }, [selectedConvo]);

  // fetch thêm tin nhắn
  const fetchMoreMessages = async () => {
    if (!activeConversationId) return;
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error('Lỗi xảy ra khi fetch thông tin: ', error);
    }
  };

  if (isTemp || (selectedConvo && messages.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-primary-foreground opacity-60">
        <div className="p-4 rounded-full bg-secondary mb-2">
          <p className="text-sm font-medium">Bắt đầu cuộc trò chuyện mới</p>
        </div>
      </div>
    );
  }

  // Nếu không có cả convo lẫn temp user thì mới hiện màn hình chào
  if (!selectedConvo && !isTemp) return <ChatWelcomeScreen />;

  if (messageLoading && messages.length === 0) {
    return <ChatWindowSkeleton />;
  }

  if (selectedConvo)
    return (
      <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
        <div
          id="scrollableDiv"
          ref={containerRef}
          onScroll={handleScrollSave}
          className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
        >
          {/* <div ref={scrollRef} className="h-0 w-0" /> */}
          <InfiniteScroll
            dataLength={messages.length}
            next={fetchMoreMessages}
            hasMore={hasMore}
            scrollableTarget="scrollableDiv"
            loader={<p>Đang tải...</p>}
            inverse={true}
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              overflow: 'visible',
            }}
          >
            {reversedMessages.map((message, index) => {
              // Trong mảng đã đảo [Mới nhất (10h) -> Cũ nhất (8h)]:
              // - newerMsg: index - 1 (về thời gian là sau tin hiện tại)
              // - olderMsg: index + 1 (về thời gian là trước tin hiện tại)
              const newerMsg = index > 0 ? reversedMessages[index - 1] : undefined;
              const olderMsg =
                index < reversedMessages.length - 1
                  ? reversedMessages[index + 1]
                  : undefined;
              const isGroup = selectedConvo.type === 'group';
              const isLastMessage = message._id === selectedConvo.lastMessage?._id;
              const participant = selectedConvo.participants.find(
                (p: IParticipant) =>
                  p.userId._id.toString() === message.senderId.toString()
              );

              // LOGIC NGÀY THÁNG: Hiện ngày nếu tin này là tin đầu tiên của ngày đó
              const isNewDay =
                !olderMsg ||
                new Date(message.createdAt).toDateString() !==
                  new Date(olderMsg.createdAt).toDateString();

              // LOGIC hiện avatar
              const isGroupBreak =
                !olderMsg || message.senderId !== olderMsg.senderId || isNewDay;
              const isEndOfGroup = !newerMsg || newerMsg.senderId !== message.senderId;

              return (
                <Fragment key={message._id}>
                  <MessageItem
                    message={message}
                    isGroupBreak={isGroupBreak}
                    isEndOfGroup={isEndOfGroup}
                    isGroup={isGroup}
                    isLastMessage={isLastMessage}
                    senderName={participant?.userId.displayName}
                    senderAvatar={participant?.userId.avatarUrl}
                    lastMessageStatus={lastMessageStatus}
                  />

                  {/* Header Ngày tháng: Trong flex-col-reverse, render sau sẽ hiện bên trên */}
                  {isNewDay && (
                    <div className="flex justify-center my-6">
                      <span className="text-xs font-medium text-secondary-foreground">
                        {getChatTimestampLabel(new Date(message.createdAt))}
                      </span>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </InfiniteScroll>
        </div>
      </div>
    );
};

export default ChatWindowBody;
