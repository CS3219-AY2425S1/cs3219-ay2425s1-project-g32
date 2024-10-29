import type { Room } from '@/types/room';

const api = (path: string, init?: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_COLLAB_SERVICE_HTTP_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export interface RunCodeRequest {
  language: string;
  code: string;
}

export interface RunCodeResponse {
  output: string;
  error: string;
}

export const runCode = async (language: string, code: string, token: string) => {
  const reqBody: RunCodeRequest = { language, code };

  const res = await api('code', {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return data as RunCodeResponse;
};

export const getRoom = async (roomId: string, token: string) => {
  const res = await api(`collab/room-details/${roomId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return data as Room;
};

export const endSession = async (roomId: string, token: string) => {
  const res = await api(`collab/end-session`, {
    method: 'POST',
    body: JSON.stringify({ roomId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
};
