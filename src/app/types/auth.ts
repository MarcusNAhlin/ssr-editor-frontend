import { User } from './user';

export interface LoginDTO{
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
}

export interface VerifyResponse {
  message: string;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  _id: string;
  email: string;
  verified: boolean;
}
