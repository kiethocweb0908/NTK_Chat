export interface IUserpopulate {
  _id: string;
  userName?: string;
  displayName: string;
  avatarUrl?: string | null;
  isBot?: boolean;
}

export interface IParticipant {
  userId: IUserpopulate;
  joinedAt: string;
}

interface ILastMessage {
  _id: string;
  content?: string | null;
  createdAt?: string | null;
  senderId: IUserpopulate;
}

interface IGroup {
  name: string;
  createdBy: string;
}

export interface IConversation {
  _id: string;
  type: 'direct' | 'group' | 'self';
  group?: IGroup;

  participants: IParticipant[];
  lastMessage?: ILastMessage | null;
  lastMessageAt?: Date;

  seenBy: IUserpopulate[];
  unreadCounts: Record<string, number>;

  createdAt: string;
  updatedAt: string;
}

export interface IConversationResponse {
  conversations: IConversation[];
}

export interface IImages {
  imgUrl?: string;
  imgId?: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  images: IImages[];

  replyTo?: IMessage;
  isDeleted?: boolean;

  createdAt: Date | string;
  updatedAt: Date | string | null;

  isOwn: boolean;
  status?: 'sending' | 'sent' | 'error';
}

export interface IFetchMessageProps {
  messages: IMessage[];
  cursor?: string;
}
