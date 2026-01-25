import axiosInstance from '@/lib/axios';

export const friendService = {
  async searchUser(keyword: string) {
    const res = await axiosInstance.get(`/user/search?keyword=${keyword}`);
    return res.data.users;
  },
  async sendFriendRequest(to: string, message: string = 'Đã gửi lời mời') {
    const res = await axiosInstance.post(`/friend/requests`, { to, message });
    return res.data;
  },
  async getFriendRequest() {
    const res = await axiosInstance.get(`/friend/requests`);
    return res.data;
  },
  async declineFriendRequest(requestId: string) {
    const res = await axiosInstance.post(`/friend/requests/${requestId}/decline`);
    return res.data;
  },
  async acceptFriendRequest(requestId: string) {
    const res = await axiosInstance.post(`/friend/requests/${requestId}/accept`);
    return res.data;
  },
  async deleteFriend(targetUserId: string) {
    const res = await axiosInstance.delete(`/friend/${targetUserId}/delete`);
    return res.data;
  },
};
