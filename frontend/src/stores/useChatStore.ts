import { chatService } from '@/services/chatService';
import type { IChatState } from '@/types/stores';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import type { IConversation, IMessage } from '@/types/chat';
import { useSocketStore } from './useSocketStore';

export const useChatStore = create<IChatState>()(
  persist(
    (set, get) => ({
      conversations: [] as IConversation[],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
        });
      },
      // Lấy danh sách cuộc trò chuyện
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { Conversations } = await chatService.fetchConversations();

          set({ conversations: Conversations, convoLoading: false });
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

          const { activeConversationId } = get();
          const res = await chatService.sendDirecMessage(data);

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
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
      addMessage: async (message) => {
        try {
          const user = useAuthStore.getState().user;
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;

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
      updateConversation: (updatedConversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === updatedConversation._id ? { ...c, ...updatedConversation } : c
          ),
        }));
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
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
