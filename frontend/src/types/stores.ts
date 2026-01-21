import type { SignInFormValues, SignUpApiRequest } from '@/schemas/auth.schema';
import type { IUser } from './user';
import type { ISignInResponse, ISignUpResponse } from './auth';
import type { IConversation, IMessage } from './chat';
import type {
  sendDirectMessageRequest,
  sendGroupMessageRequest,
} from '@/schemas/message.schema';
import type { Socket } from 'socket.io-client';

export interface IAuthStore {
  accessToken: string | null;
  user: IUser | null;
  loading: boolean;

  clearState: () => void;
  setAccessToken: (accessToken: string) => void;

  signUp: (data: SignUpApiRequest) => Promise<ISignUpResponse>;
  signIn: (data: SignInFormValues) => Promise<ISignInResponse>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface IThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface IChatState {
  conversations: IConversation[];
  messages: Record<
    string,
    {
      items: IMessage[];
      hasMore: boolean;
      nextCursor?: string | null;
    }
  >;
  activeConversationId: string | null;
  convoLoading: boolean;
  messageLoading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (data: sendDirectMessageRequest) => Promise<void>;
  sendGroupMessage: (data: sendGroupMessageRequest) => Promise<void>;
  addMessage: (message: IMessage) => Promise<void>;
  updateConversation: (conversation: IConversation) => void;
  markAsSeen: () => Promise<void>;
}

export interface ISocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}
