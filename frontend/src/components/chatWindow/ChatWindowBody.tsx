import { useChatStore } from '@/stores/useChatStore';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import MessageItem from './MessageItem';
import type { IParticipant } from '@/types/chat';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getChatTimestampLabel } from '@/lib/utils';
import InfiniteScroll from 'react-infinite-scroll-component';

const ChatWindowBody = () => {
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const selectedConvo = useChatStore(
    (s) => s.conversations.find((c) => c._id === s.activeConversationId) ?? null
  );
  const [lastMessageStatus, setLastMessageStatus] = useState<'delivered' | 'seen'>(
    'delivered'
  );
  const messages = useChatStore((s) =>
    s.activeConversationId ? (s.messages[s.activeConversationId]?.items ?? []) : []
  );
  const reversedMessages = [...messages].reverse();
  const hasMore = useChatStore((s) =>
    s.activeConversationId ? s.messages[s.activeConversationId]?.hasMore : false
  );

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

  if (!selectedConvo) return <ChatWelcomeScreen />;
  if (!messages?.length) {
    return <div>Chưa có tin nhắn nào trong cuộc trò chuyện này</div>;
  }

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
            console.log(selectedConvo);
            const isGroup = selectedConvo.type === 'group';
            const isLastMessage = message._id === selectedConvo.lastMessage?._id;
            const participant = selectedConvo.participants.find(
              (p: IParticipant) => p._id.toString() === message.senderId.toString()
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
                  senderName={participant?.displayName}
                  senderAvatar={participant?.avatarUrl}
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
