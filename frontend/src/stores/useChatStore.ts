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
          set({ convoLoading: true });
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
        try {
          // set({ messageLoading: true });

          const { activeConversationId, moveConversationToTop, tempChatUser } = get();
          const res = await chatService.sendDirecMessage(data);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));

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
          console.error('Store sendDirectMessage Error:', error);
          throw error;
        } finally {
          // set({ messageLoading: false });
        }
      },
      // Gửi tin group
      sendGroupMessage: async (data) => {
        try {
          // set({ messageLoading: true });
          const { activeConversationId } = get();
          const user = useAuthStore.getState().user;
          if (!user) return;
          await chatService.sendGroupMessage(data);

          set((state) => ({
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
          }));
        } catch (error) {
          console.error('Store sendGroupMessage Error:', error);
          throw error;
        } finally {
          // set({ messageLoading: false });
        }
      },
      addMessage: async (message: any) => {
        try {
          const user = useAuthStore.getState().user;
          const { fetchMessages } = get();

          const senderId =
            typeof message.senderId === 'object'
              ? message.senderId._id
              : message.senderId;
          message.isOwn = senderId === user?._id;

          const convoId = message.conversationId;

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
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
