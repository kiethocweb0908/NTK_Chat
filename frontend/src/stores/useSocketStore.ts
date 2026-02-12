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

    // --- LẮNG NGHE BOT CHUNK Ở ĐÂY ---
    socket.on('bot-chunk', (data) => {
      const chatStore = useChatStore.getState();

      const isFirstChunk = !chatStore.messages[data.conversationId]?.items.some(
        (m) => m._id === data.messageId
      );

      // Gọi action handleBotChunk từ ChatStore để cập nhật UI
      chatStore.handleBotChunk(data);

      if (isFirstChunk && chatStore.activeConversationId === data.conversationId) {
        chatStore.markAsSeen();
      }
    });

    // online users
    socket.on('online-users', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    // tin nhắn mới
    socket.on('new-message', ({ newMessage, updatedConversation }) => {
      const user = useAuthStore.getState().user;
      if (newMessage.senderId !== user?._id)
        useChatStore.getState().addMessage(newMessage);

      // console.log('updatedConversation: ', updatedConversation);
      const existing = useChatStore
        .getState()
        .conversations.some((c) => c._id === updatedConversation._id);
      if (!existing) {
        useChatStore.getState().addConversation(updatedConversation);
      } else {
        useChatStore.getState().updateConversation(updatedConversation);
        useChatStore.getState().moveConversationToTop(updatedConversation._id);
      }

      if (useChatStore.getState().activeConversationId === updatedConversation._id) {
        // đánh dáu tin đã đọc
        useChatStore.getState().markAsSeen();
      }

      playNotifySound();
    });

    // xem tin
    socket.on('read-message', ({ updatedConversation }) => {
      // const updated = {
      //   _id: conversation._id,
      //   lastMessage,
      //   lastMessageAt: conversation.lastMessageAt,
      //   unreadCounts: conversation.unreadCounts,
      //   seenBy: conversation.seenBy,
      // };

      useChatStore.getState().updateConversation(updatedConversation);
    });

    // nhận lời mời kết bạn
    socket.on('friend-request-received', ({ request }) => {
      useFriendStore.setState((state) => ({
        received: [request, ...state.received],
      }));

      // cập nhật nếu đang trong tìm kiếm
      useFriendStore
        .getState()
        .updateUserRelationship(request.from._id, 'received', request._id);

      toast.info(`📩 ${request.from.displayName} gửi lời mời kết bạn`);
      playSendRequestSound();
    });

    // huỷ/từ chối kết bạn
    socket.on('friend-request-decline', ({ message, requestId, actorId }) => {
      useFriendStore.setState((state) => ({
        sent: state.sent.filter((r) => r._id !== requestId),
        received: state.received.filter((r) => r._id !== requestId),
      }));

      // cập nhật khi đang tìm kiếm
      useFriendStore.getState().updateUserRelationship(actorId, 'none', undefined);

      toast.info(`❌ ${message}`);
      playDeclineSound();
    });

    // chấp nhận kết bạn
    socket.on('friend-request-accepted', ({ newFriend, requestId, message }) => {
      // thêm vào danh sách bạn
      useFriendStore.setState((state) => ({
        friends: [newFriend, ...state.friends],
        sent: state.sent.filter((s) => s._id !== requestId),
      }));

      // cập nhật khi đang tìm kiếm
      useFriendStore
        .getState()
        .updateUserRelationship(newFriend._id, 'friend', undefined);

      toast.info(message);
      playSuccessSound();
    });

    // xoá bạn
    socket.on('friend-delete', ({ message, oldFriend }) => {
      // cập nhật state bạn bè
      useFriendStore.setState((prev) => ({
        friends: prev.friends.filter((f) => f._id !== oldFriend._id),
      }));

      // cập nhật khi đang tìm kiếm
      useFriendStore.getState().updateUserRelationship(oldFriend._id, 'none', undefined);

      toast.info(message);
      playDeclineSound();
    });

    // tạo group
    socket.on('group-created', (newConversation) => {
      // 1. Lấy trạng thái hiện tại từ ChatStore
      const { conversations } = useChatStore.getState();
      const currentUserId = useAuthStore.getState().user?._id;

      // 2. KIỂM TRA TRÙNG LẶP: Nếu ID đã tồn tại trong mảng thì dừng luôn
      const isAlreadyExisted = conversations.some((c) => c._id === newConversation._id);

      if (isAlreadyExisted) {
        console.log('Conversation đã tồn tại, bỏ qua cập nhật Socket.');
        return;
      }

      // 3. THÊM VÀO UI: Nếu chưa có thì mới đưa lên đầu danh sách

      // 4. THÔNG BÁO: Chỉ báo cho người được mời (không báo cho người vừa bấm nút Tạo)
      if (newConversation.group?.createdBy !== currentUserId) {
        useChatStore.setState((state) => ({
          conversations: [newConversation, ...state.conversations],
        }));
        toast.info(`Bạn đã được thêm vào nhóm: ${newConversation.group.name}`);
        playSuccessSound();
      }
    });

    socket.on('message-recalled', (data) => {
      useChatStore.getState().updateMessageRecalled(data);
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
