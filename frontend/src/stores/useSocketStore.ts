import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { ISocketState } from '@/types/stores';
import { useChatStore } from './useChatStore';

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<ISocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return;

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    set({ socket });

    socket.on('connect', () => {
      console.log('Đã kết nối với socket');
    });

    // online users
    socket.on('online-users', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    // tin nhắn mới
    socket.on('new-message', ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createAt: conversation.lastMessage.createAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: '',
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      console.log('updatedConversation: ', updatedConversation);

      if (useChatStore.getState().activeConversationId === conversation._id) {
        // đánh dáu tin đã đọc
      }

      useChatStore.getState().updateConversation(updatedConversation);
    });

    // lỗi kết nối
    socket.on('connect_error', (error) => {
      console.error('Lỗi kết nối Socket:', error.message);
      // Bạn có thể dùng toast.error(error.message) để báo cho người dùng
    });

    // mất kết nối
    socket.on('disconnect', (reason) => {
      console.log('Mất kết nối:', reason);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;

    if (socket) {
      socket.off();
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
