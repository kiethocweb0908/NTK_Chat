import { friendService } from '@/services/friendSerivce';
import type { IFriendState } from '@/types/stores';
import { create } from 'zustand';

export const useFriendStore = create<IFriendState>((set, get) => ({
  loading: false,
  sent: [],
  received: [],
  hasFetched: false,
  searchUsers: async (keyword) => {
    try {
      set({ loading: true });
      const users = await friendService.searchUser(keyword);
      return users;
    } catch (error) {
      console.error('Store searchUsers Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  sendFriendRequest: async (to, message) => {
    try {
      set({ loading: true });
      const res = await friendService.sendFriendRequest(to, message);

      set((state) => ({
        sent: [res.request, ...state.sent],
      }));

      return res;
    } catch (error: any) {
      console.error('Store addFriend Error:', error);
      return error.response.data.message;
    } finally {
      set({ loading: false });
    }
  },
  getFriendRequest: async () => {
    try {
      set({ loading: true });
      const res = await friendService.getFriendRequest();
      set({ sent: res.sent, received: res.received, hasFetched: true });
    } catch (error) {
      console.error('Store getFriendRequest Error:', error);
    } finally {
      set({ loading: false });
    }
  },
  declineFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      const { sent, received } = get();

      const res = await friendService.declineFriendRequest(requestId);

      set({
        sent: sent.filter((r) => r._id !== requestId),
        received: received.filter((r) => r._id !== requestId),
      });

      return res;
    } catch (error) {
      console.error('Store declineFriendRequest Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  acceptFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      const { received } = get();
      const res = await friendService.acceptFriendRequest(requestId);

      set({
        received: received.filter((r) => r._id !== requestId),
      });

      return res;
    } catch (error) {
      console.error('Store acceptFriendRequest Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteFriend: async (targetUserId) => {
    try {
      set({ loading: true });
      const res = await friendService.deleteFriend(targetUserId);

      // cập nhật state bạn bè
      //...

      return res;
    } catch (error: any) {
      console.error('Store deleteFriend Error:', error);
      return error.response.data.message;
    } finally {
      set({ loading: false });
    }
  },
}));
