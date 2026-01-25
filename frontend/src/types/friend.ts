import type { IUser } from './user';

export type RelationshipType = 'friend' | 'sent' | 'received' | 'none';

export interface ISearchUserResponse extends IUser {
  relationship: RelationshipType;
  requestId?: string;
}

export interface ISent {
  _id: string;
  from: string;
  to: IUser;
  message?: string;
}

export interface IReceived {
  _id: string;
  from: IUser;
  to: string;
  message?: string;
}

export interface IFriendRequests {
  message?: string;
  sent: ISent[];
  received: IReceived[];
}

export interface IDecline {
  message: string;
  targetId: string;
}

export interface IRequest {
  _id: string;
  from: IUser;
  to: IUser;
  message?: string;
}

export interface IFriendSendRequest {
  message: string;
  request: IRequest;
}

export interface IFriendRequestAccept {
  message: string;
  newFriend: IUser;
}

export interface IFirendRequestDecline {
  message: string;
  targetUserId: string;
}

export interface IDeleteFriend {
  message: string;
  oldFriend: IUser;
}
