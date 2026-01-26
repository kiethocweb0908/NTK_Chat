import axiosInstance from '@/lib/axios';
import { type IConversationResponse, type IFetchMessageProps } from '../types/chat';
import type {
  sendDirectMessageRequest,
  sendGroupMessageRequest,
} from '@/schemas/message.schema';
import type { CreateGroupType } from '@/schemas/conversation';

const pageLimit = 50;

export const chatService = {
  async fetchConversations(): Promise<IConversationResponse> {
    const res = await axiosInstance.get('/conversation/');
    return res.data;
  },

  async fetchMessages(id: string, cursor?: string): Promise<IFetchMessageProps> {
    const res = await axiosInstance.get(
      `/conversation/${id}/messages?limit=${pageLimit}&cursor=${cursor}`
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendDirecMessage(data: sendDirectMessageRequest) {
    const res = await axiosInstance.post(`/message/direct`, data);

    return res.data.message;
  },

  async sendGroupMessage(data: sendGroupMessageRequest) {
    const res = await axiosInstance.post(`/message/group`, data);
    return res.data.message;
  },

  async markAsSeen(conversationId: string) {
    const res = await axiosInstance.patch(`/conversation/${conversationId}/seen`);
    return res.data;
  },
  async createGroup(data: CreateGroupType) {
    const res = await axiosInstance.post(`/conversation/add-group`, data);
    return res.data;
  },
};
