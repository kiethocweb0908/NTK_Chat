export interface IUser {
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
