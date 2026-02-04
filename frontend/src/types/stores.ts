import type {
  resendOTPType,
  ResetPasswordType,
  SignInFormValues,
  SignUpApiRequest,
  VerifyOTPType,
} from '@/schemas/auth.schema';
import type { IUser } from './user';
import type { ISignInResponse, ISignUpResponse } from './auth';
import type { IConversation, IMessage, IUserpopulate } from './chat';
import type {
  sendDirectMessageRequest,
  sendGroupMessageRequest,
} from '@/schemas/message.schema';
import type { Socket } from 'socket.io-client';
import type {
  IChatBot,
  IDecline,
  IDeleteFriend,
  IFirendRequestDecline,
  IFriend,
  IFriendRequestAccept,
  IFriendRequests,
  IFriendSendRequest,
  IReceived,
  ISearchUserResponse,
  ISent,
} from './friend';
import type { CreateGroupType } from '@/schemas/conversation';
import type { UpdateProfileRequest } from '@/schemas/user.schema';

export interface IAuthStore {
  accessToken: string | null;
  user: IUser | null;
  loading: boolean;
  tempEmail: string | null;
  resetToken: string | null;
  authType: 'REGISTER' | 'FORGOT_PASSWORD' | null;

  clearState: () => void;
  setAccessToken: (accessToken: string) => void;

  signUp: (data: SignUpApiRequest) => Promise<ISignUpResponse>;
  resendOTP: (data: resendOTPType) => Promise<string>;
  verifyOTPRegister: (data: VerifyOTPType) => Promise<void>;

  forgotPassword: (email: string) => Promise<string>;
  verifyOTPforgotPassword: (data: VerifyOTPType) => Promise<void>;
  resetPassword: (data: ResetPasswordType) => Promise<string>;

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
  tempChatUser: IUserpopulate | null;
  isSending: boolean;
  isTyping: Record<string, boolean>;

  setTyping: (convoId: string, status: boolean) => void;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  updateConversation: (conversation: IConversation) => void;
  moveConversationToTop: (conversationId: string) => void;
  addConversation: (conversation: IConversation) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (data: sendDirectMessageRequest) => Promise<void>;
  sendGroupMessage: (data: sendGroupMessageRequest) => Promise<void>;
  addMessage: (message: IMessage) => Promise<void>;

  markAsSeen: () => Promise<void>;
  createGroup: (data: CreateGroupType) => Promise<string>;
  handleStartChat: (targetUserId: string) => Promise<void>;
  handleBotChunk: (data: {
    conversationId: string;
    messageId: string;
    chunk: string;
    senderId: string;
  }) => void;
}

export interface ISocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export interface IFriendState {
  loading: boolean;
  sent: ISent[];
  received: IReceived[];
  hasFetched: boolean;
  users: ISearchUserResponse[];
  chatbots: IChatBot[];

  friends: IFriend[];
  nextCursor: string | null;
  hasNextPage: boolean;
  isSearchingFriends: boolean;

  clearUsers: () => void;
  clearFriend: () => void;
  clearChatBots: () => void;

  updateUserRelationship: (
    userId: string,
    relationship: 'none' | 'sent' | 'received' | 'friend',
    requestId?: string
  ) => void;
  searchUsers: (keyword: string) => Promise<void>;
  sendFriendRequest: (to: string, message?: string) => Promise<string>;
  getFriendRequest: () => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<string>;
  acceptFriendRequest: (requestId: string) => Promise<string>;
  deleteFriend: (targetUserId: string) => Promise<string>;
  searchFriends: (keyword: string) => Promise<void>;
  getFriends: (limit: number, cursor?: string | null) => Promise<void>;
  getChatBots: () => Promise<void>;
}

export interface IuseUserState {
  isUpdating: boolean;
  imageFile: File | null;
  setImageFile: (file: File) => void;
  clearImageFile: () => void;
  updateProfile: (profileData: UpdateProfileRequest) => Promise<string>;
}
