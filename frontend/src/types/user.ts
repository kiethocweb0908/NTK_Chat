export interface IUser {
  _id: string;
  userName: string;
  email: string;
  // phone?: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  displayName: string;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
