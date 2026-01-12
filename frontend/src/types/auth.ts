import type { IUser } from './user';

export interface ISignUpResponse {
  message: string;
  user?: IUser; // Dấu ? vì có thể BE chỉ trả về message, hoặc trả cả user
  accessToken?: string;
}

export interface ISignInResponse {
  message: string;
  user?: IUser;
  accessToken?: string;
}
