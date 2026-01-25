import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import type { ISocketState } from '@/types/stores';
import { useChatStore } from './useChatStore';
import { useFriendStore } from './useFriendStore';
import { toast } from 'sonner';
import {
  playDeclineSound,
  playNotifySound,
  playSendRequestSound,
  playSuccessSound,
} from '@/lib/notificationSound';

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
        createdAt: conversation.lastMessage.createdAt,
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
        useChatStore.getState().markAsSeen();
      }

      useChatStore.getState().updateConversation(updatedConversation);
      playNotifySound();
    });

    // xem tin
    socket.on('read-message', ({ conversation, lastMessage }) => {
      // const updated = {
      //   _id: conversation._id,
      //   lastMessage,
      //   lastMessageAt: conversation.lastMessageAt,
      //   unreadCounts: conversation.unreadCounts,
      //   seenBy: conversation.seenBy,
      // };

      const updated = {
        ...conversation,
        lastMessage,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // nhận lời mời kết bạn
    socket.on('friend-request-received', ({ request }) => {
      useFriendStore.setState((state) => ({
        received: [request, ...state.received],
      }));
      toast.info(`📩 ${request.from.displayName} gửi lời mời kết bạn`);
      playSendRequestSound();
    });

    // huỷ/từ chối kết bạn
    socket.on('friend-request-decline', ({ message, requestId }) => {
      useFriendStore.setState((state) => ({
        sent: state.sent.filter((r) => r._id !== requestId),
        received: state.received.filter((r) => r._id !== requestId),
      }));
      toast.info(`❌ ${message}`);
      playDeclineSound();
    });

    // chấp nhận kết bạn
    socket.on('friend-request-accepted', ({ newFriend, requestId, message }) => {
      // thêm vào danh sách bạn
      //...

      useFriendStore.setState((state) => ({
        sent: state.sent.filter((s) => s._id !== requestId),
      }));

      toast.info(message);
      playSuccessSound();
    });

    // xoá bạn
    socket.on('friend-delete', ({ message, oldFriend }) => {
      // cập nhật state bạn bè
      //...

      toast.info(message);
      playDeclineSound();
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
