import { friendService } from '@/services/friendSerivce';
import type { IFriendState } from '@/types/stores';
import { create } from 'zustand';

export const useFriendStore = create<IFriendState>((set, get) => ({
  loading: false,
  sent: [],
  received: [],
  hasFetched: false,
  users: [],
  friends: [],
  nextCursor: null,
  hasNextPage: false,
  isSearchingFriends: false,

  clearUsers: () => {
    set({ users: [] });
  },
  clearFriend: () => {
    set({ friends: [] });
  },

  updateUserRelationship: (userId, relationship, requestId) => {
    const { users } = get();
    if (users.length === 0) return;

    set((state) => ({
      users: state.users.map((u) =>
        u._id === userId ? { ...u, relationship, requestId } : u
      ),
    }));
  },
  searchUsers: async (keyword) => {
    try {
      set({ loading: true });
      const users = await friendService.searchUser(keyword);
      set({ users });
      // return users;
    } catch (error) {
      console.error('Store searchUsers Error:', error);
      get().clearUsers();
      throw error;
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
  sendFriendRequest: async (to, message) => {
    try {
      set({ loading: true });
      const { updateUserRelationship } = get();
      const res = await friendService.sendFriendRequest(to, message);

      updateUserRelationship(to, 'sent', res.request._id);

      set((state) => ({
        sent: [res.request, ...state.sent],
      }));

      return res.message;
    } catch (error) {
      console.error('Store addFriend Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  declineFriendRequest: async (requestId) => {
    try {
      set({ loading: true });
      const { sent, received, updateUserRelationship } = get();

      const res = await friendService.declineFriendRequest(requestId);

      updateUserRelationship(res.targetUserId, 'none', undefined);

      set({
        sent: sent.filter((r) => r._id !== requestId),
        received: received.filter((r) => r._id !== requestId),
      });

      return res.message;
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
      const { updateUserRelationship } = get();
      const res = await friendService.acceptFriendRequest(requestId);

      updateUserRelationship(res.newFriend._id, 'friend', undefined);

      set((prev) => ({
        received: prev.received.filter((r) => r._id !== requestId),
        friends: [res.newFriend, ...prev.friends],
      }));

      return res.message;
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
      const { updateUserRelationship } = get();
      const res = await friendService.deleteFriend(targetUserId);
      updateUserRelationship(res.oldFriend._id, 'none', undefined);

      // cập nhật state bạn bè
      set((prev) => ({
        friends: prev.friends.filter((f) => f._id !== res.oldFriend._id),
      }));

      return res.message;
    } catch (error) {
      console.error('Store deleteFriend Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  searchFriends: async (keyword) => {
    try {
      set({ loading: true, isSearchingFriends: true });

      const res = await friendService.searchFriends(keyword);

      set({
        friends: res.friends,
        nextCursor: null,
        hasNextPage: false,
      });
    } catch (error) {
      console.error('Store searchFriends Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  getFriends: async (limit = 20, cursor) => {
    try {
      set({ loading: true });
      const res = await friendService.getFriends(limit, cursor);

      set((state) => ({
        // Nếu có cursor (load more) thì nối mảng, nếu không (trang đầu) thì thay thế
        friends: cursor ? [...state.friends, ...res.friends] : res.friends,
        nextCursor: res.nextCursor,
        hasNextPage: res.hasNextPage,
        isSearchingFriends: false, // Thoát chế độ search
      }));
    } catch (error) {
      console.error('Store getFriends Error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
