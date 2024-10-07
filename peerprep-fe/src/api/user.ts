import type { User } from '@/types/user';

const api = (path: string, init: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_USERS_BACKEND_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export interface VerifyTokenResponse extends BaseResponse {
  data: Omit<User, 'createdAt'>;
}

export const verifyToken = async (token: string) => {
  const res = await api('verify-token', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as VerifyTokenResponse;
};

interface SignInResponse extends BaseResponse {
  data: {
    accessToken: string;
  } & User;
}

export const signIn = async (email: string, password: string) => {
  const res = await api('auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as SignInResponse;
};

interface SignUpResponse extends BaseResponse {
  data: User;
}

export const signUp = async (username: string, email: string, password: string) => {
  const res = await api('users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as SignUpResponse;
};
