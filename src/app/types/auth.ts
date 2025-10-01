import { User } from  './user';

export interface LoginDto {
  email: string,
  password: string,
};

export interface LoginResponse { 
    token: string; 
    refresh_token?: string; 
    user?: User;
};

export interface RegisterDto {
  email: string,
  password: string,
};

export interface VerifyResponse {
  message: string;
}

export interface AuthSuccessResponse {
  token: string;
  refresh_token?: string;
  user?: User;
}

export type RegisterResponse = VerifyResponse | AuthSuccessResponse;

