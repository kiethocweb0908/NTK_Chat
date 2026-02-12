import { chatService } from '@/services/chatService';
import type { IChatState } from '@/types/stores';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import type { IConversation, IMessage } from '@/types/chat';

export const useChatStore = create<IChatState>()(
  persist(
    (set, get) => ({
      conversations: [] as IConversation[],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      tempChatUser: null,
      isSending: false,
      isTyping: {},
      replyingMessage: null,

      setTyping: (convoId: string, status: boolean) => {
        set((state) => ({
          isTyping: { ...state.isTyping, [convoId]: status },
        }));
      },

      setReplyingMessage: (message) => {
        set({
          replyingMessage: message,
        });
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
        });
      },
      updateConversation: (updatedConversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === updatedConversation._id ? updatedConversation : c
          ),
        }));
      },
      moveConversationToTop: (conversationId) => {
        set((state) => {
          const convoToMove = state.conversations.find((c) => c._id === conversationId);
          if (!convoToMove) return state;

          const otherConversations = state.conversations.filter(
            (c) => c._id !== conversationId
          );

          return {
            conversations: [convoToMove, ...otherConversations],
          };
        });
      },
      addConversation: (conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));
      },

      // Lấy danh sách cuộc trò chuyện
      fetchConversations: async () => {
        try {
          const isInitialFetch = get().conversations.length === 0;
          if (isInitialFetch) set({ convoLoading: true });

          const { conversations } = await chatService.fetchConversations();

          set({ conversations, convoLoading: false });
        } catch (error) {
          set({ convoLoading: false });
          console.error('Store fetchConversations Error:', error);
          throw error;
        }
      },
      // Lấy tin nhắn
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();

        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        const nextCursor = current?.nextCursor === undefined ? '' : current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged = prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error('Store fetchMessages Error:', error);
          throw error;
        } finally {
          set({ messageLoading: false });
        }
      },
      // Gửi tin 1-1
      sendDirectMessage: async (data) => {
        const {
          activeConversationId,
          messages,
          conversations,
          moveConversationToTop,
          tempChatUser,
          setTyping,
        } = get();
        const user = useAuthStore.getState().user;
        if (!user) return;

        // 1. Tạo ID tạm thời (giúp UI không bị trùng và để sau này thay thế)
        const tempId = `temp-${Date.now()}`;
        const convoId = data.conversationId || activeConversationId || 'temp';

        // 2. Tạo tin nhắn "giả" (Optimistic Message)
        const optimisticMessage: IMessage = {
          _id: tempId,
          conversationId: convoId,
          senderId: user._id,
          content: data.content,
          images: [],
          status: 'sending', // Trạng thái đang gửi
          isOwn: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 3. Đẩy tin nhắn giả vào UI ngay lập tức
        set((state) => {
          const currentConvo = state.messages[convoId] || { items: [] };
          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...currentConvo,
                items: [...currentConvo.items, optimisticMessage],
              },
            },
          };
        });

        const currentConvo = conversations.find((c) => c._id === activeConversationId);

        console.log('currentConvo: ', currentConvo);
        const isChattingWithAI = currentConvo?.participants?.some(
          (p) => p.userId.isBot === true || p.userId.userName === 'NTK_AI'
        );
        console.log('isChattingWithAI: ', isChattingWithAI);
        console.log('activeConversationId: ', activeConversationId);

        // 3. Chỉ bật typing nếu là chat với AI
        if (isChattingWithAI && activeConversationId) {
          setTyping(activeConversationId, true);
        }

        try {
          set({ isSending: true });
          // await new Promise((resolve) => setTimeout(resolve, 5000));
          const res = await chatService.sendDirecMessage(data);

          // 4. Khi thành công: Thay thế tin nhắn "giả" bằng tin nhắn "thật" từ Server
          set((state) => {
            const currentItems = state.messages[convoId]?.items || [];
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  ...state.messages[convoId],
                  items: currentItems.map((m) =>
                    m._id === tempId ? { ...res, status: 'sent', isOwn: true } : m
                  ),
                },
              },
            };
          });

          if (activeConversationId) {
            moveConversationToTop(activeConversationId);
          }
          if (!activeConversationId && tempChatUser) {
            set({
              activeConversationId: res.conversationId,
              tempChatUser: null,
            });
          }
        } catch (error) {
          // 5. Nếu lỗi: Cập nhật trạng thái thành 'error' để user biết mà gửi lại
          set((state) => ({
            messages: {
              ...state.messages,
              [convoId]: {
                ...state.messages[convoId],
                items: state.messages[convoId].items.map((m) =>
                  m._id === tempId ? { ...m, status: 'error' } : m
                ),
              },
            },
          }));

          console.error('Store sendDirectMessage Error:', error);
          throw error;
        } finally {
          set({ isSending: false });
        }
      },
      // Gửi tin group
      sendGroupMessage: async (data) => {
        const { activeConversationId, moveConversationToTop } = get();
        const user = useAuthStore.getState().user;
        if (!user) return;

        const tempId = `temp-${Date.now()}`;
        const convoId = data.conversationId || activeConversationId;
        if (!convoId) return;

        // 1. Tạo tin nhắn giả cho Group
        const optimisticMessage: IMessage = {
          _id: tempId,
          conversationId: convoId,
          senderId: user._id,
          content: data.content,
          images: [],
          status: 'sending',
          isOwn: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 2. Đẩy vào UI ngay
        set((state) => {
          const currentConvo = state.messages[convoId] || { items: [] };
          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...currentConvo,
                items: [...currentConvo.items, optimisticMessage],
              },
            },
          };
        });

        try {
          set({ isSending: true });
          // await new Promise((resolve) => setTimeout(resolve, 3000));

          const res = await chatService.sendGroupMessage(data);

          set((state) => {
            const currentItems = state.messages[convoId]?.items || [];
            console.log('currentItems: ', currentItems);
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  ...state.messages[convoId],
                  items: currentItems.map((m) =>
                    m._id === tempId ? { ...res, status: 'sent', isOwn: true } : m
                  ),
                },
              },
              conversations: state.conversations.map((c) =>
                c._id === activeConversationId
                  ? {
                      ...c,
                      seenBy: [
                        {
                          _id: user?._id,
                          userName: user.userName,
                          displayName: user?.displayName,
                          avatarUrl: user?.avatarUrl ?? null,
                        },
                      ],
                    }
                  : c
              ),
            };
          });
          moveConversationToTop(convoId);
        } catch (error) {
          // 4. Báo lỗi nếu gửi thất bại
          set((state) => ({
            messages: {
              ...state.messages,
              [convoId]: {
                ...state.messages[convoId],
                items: state.messages[convoId].items.map((m) =>
                  m._id === tempId ? { ...m, status: 'error' } : m
                ),
              },
            },
          }));

          console.error('Store sendGroupMessage Error:', error);
          throw error;
        } finally {
          set({ isSending: false });
        }
      },
      addMessage: async (message: any) => {
        try {
          const user = useAuthStore.getState().user;
          const convoId = message.conversationId;
          const { fetchMessages } = get();

          const senderId =
            typeof message.senderId === 'object'
              ? message.senderId._id
              : message.senderId;
          message.isOwn = senderId === user?._id;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(convoId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId].hasMore,
                  nextCursor: state.messages[convoId].nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error('Store addMessage Error:', error);
        }
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();

          if (!activeConversationId || !user) return;

          const convo = conversations.find((c) => c._id === activeConversationId);
          if (!convo) return;

          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) return;

          await chatService.markAsSeen(activeConversationId);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId
                ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: 0 } }
                : c
            ),
          }));
        } catch (error) {
          console.error('Store markAsSeen Error:', error);
        }
      },
      createGroup: async (data) => {
        try {
          set({ convoLoading: true });

          const res = await chatService.createGroup(data);

          set((state) => ({
            conversations: [res.newGroup, ...state.conversations],
            activeConversationId: res.newGroup._id,
          }));

          return res.message;
        } catch (error) {
          console.log('Store createGroup Error:', error);
          throw error;
        } finally {
          set({ convoLoading: false });
        }
      },
      handleStartChat: async (targetUserId) => {
        try {
          set({ convoLoading: true });
          const res = await chatService.handleStartChat(targetUserId);

          if (res.conversation) {
            // CÓ HỘI THOẠI CŨ
            set({
              activeConversationId: res.conversation._id,
              tempChatUser: null,
            });
            get().fetchMessages(res.conversation._id);
          } else {
            // CHƯA CÓ HỘI THOẠI
            set({
              activeConversationId: null, // Không có ID hội thoại thực tế
              tempChatUser: res.targetUser, // Lưu thông tin người này để hiện Header
            });
            // Xóa tin nhắn cũ của cửa sổ trước đó nếu có
            set({
              messages: {
                ...get().messages,
                ['temp']: {
                  items: [],
                  hasMore: false,
                  nextCursor: null,
                },
              },
            });
          }
        } catch (error) {
          console.error('Store handleStartChat Error:', error);
        } finally {
          set({ convoLoading: false });
        }
      },
      handleBotChunk: (data) => {
        const convoId = data.conversationId;

        // TẮT typing ngay khi có dữ liệu đổ về
        if (get().isTyping[convoId]) {
          get().setTyping(convoId, false);
        }

        set((state) => {
          const currentConvo = state.messages[convoId] || {
            items: [],
            hasMore: false,
            nextCursor: null,
          };
          const currentMessages = currentConvo.items;

          const existingIndex = currentMessages.findIndex(
            (m) => m._id === data.messageId
          );

          let updatedItems: IMessage[];

          if (existingIndex !== -1) {
            // Nếu đã có: Cộng dồn nội dung
            updatedItems = [...currentMessages];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              content: updatedItems[existingIndex].content + data.chunk,
              updatedAt: new Date().toISOString(), // Cập nhật cả thời gian update
            };
          } else {
            // Nếu chưa có: Tạo mới và ép kiểu sang IMessage
            const newBotMsg: IMessage = {
              _id: data.messageId,
              conversationId: convoId,
              senderId: data.senderId as any, // Ép kiểu nếu senderId trong IMessage là object
              content: data.chunk,
              isOwn: false,
              images: [], // Bổ sung trường thiếu
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(), // Bổ sung trường thiếu
            };
            updatedItems = [...currentMessages, newBotMsg];
          }

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...currentConvo,
                items: updatedItems,
              },
            },
          };
        });
      },

      recallMessage: async (messageId) => {
        try {
          set({ messageLoading: true });
          const res = await chatService.recallMessage(messageId);
          //...
          return res.message;
        } catch (error) {
          console.error('recallMessage error: ', error);
          throw error;
        } finally {
          set({ messageLoading: false });
        }
      },
      updateMessageRecalled: (data) => {
        const { conversationId, messageId, lastMessageContent } = data;
        set((state) => {
          // 1. Cập nhật tin nhắn trong Record "messages"
          const currentChat = state.messages[conversationId];
          let updatedMessagesRecord = { ...state.messages };
          if (currentChat) {
            updatedMessagesRecord[conversationId] = {
              ...currentChat,
              items: currentChat.items.map((msg) =>
                msg._id === messageId
                  ? { ...msg, isDeleted: true, content: '', images: [] }
                  : msg
              ),
            };
          }

          // 2. Cập nhật danh sách conversations
          let updatedConversations = [...state.conversations];
          if (lastMessageContent) {
            updatedConversations = state.conversations.map((conv) => {
              return conv._id === conversationId
                ? {
                    ...conv,
                    lastMessage:
                      conv.lastMessage?._id === messageId
                        ? {
                            ...conv.lastMessage,
                            content: lastMessageContent,
                          }
                        : conv.lastMessage,
                  }
                : conv;
            });
          }

          return {
            messages: updatedMessagesRecord,
            conversations: updatedConversations,
          };
        });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
