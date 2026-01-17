export interface IParticipant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

interface ILastMessage {
  _id: string;
  content?: string | null;
  createdAt?: string | null;
  senderId: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

interface IGroup {
  name: string;
  createdBy: string;
}

interface ISeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface IConversation {
  _id: string;
  type: 'direct' | 'group' | 'self';
  group?: IGroup;

  participants: IParticipant[];
  lastMessage?: ILastMessage | null;
  lastMessageAt?: Date;

  seenBy: ISeenUser[];
  unreadCounts: Record<string, number>;

  createdAt: string;
  updatedAt: string;
}

export interface IConversationResponse {
  Conversations: IConversation[];
}

interface IImages {
  imgUrl?: string;
  imgId?: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  images: IImages[];

  replyTo?: string;

  createdAt: string;
  updatedAt: string | null;

  isOwn?: boolean;
}

export interface IFetchMessageProps {
  messages: IMessage[];
  cursor?: string;
}
