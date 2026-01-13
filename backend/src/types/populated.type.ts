import mongoose from 'mongoose';

export interface IPopulatedUser {
  _id: mongoose.Types.ObjectId | string;
  displayName: string;
  avatarUrl?: string;
}

export interface IPopulatedFriendship {
  _id: mongoose.Types.ObjectId;
  userA: IPopulatedUser;
  userB: IPopulatedUser;
}

export interface IPopulatedParticipant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: Date;
}
