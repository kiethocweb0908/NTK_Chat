import type { SignInFormValues, SignUpApiRequest } from '@/schemas/auth.schema';
import type { IUser } from './user';
import type { ISignInResponse, ISignUpResponse } from './auth';

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
