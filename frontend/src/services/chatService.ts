import axiosInstance from '@/lib/axios';
import { type IConversationResponse, type IFetchMessageProps } from '../types/chat';

const pageLimit = 50;

export const chatSerivce = {
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
};
