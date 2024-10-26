const api = (path: string, init?: RequestInit) => {
  console.log(init);
  return fetch(`${process.env.NEXT_PUBLIC_COLLAB_SERVICE_WEBSOCKET_URL || ''}/code`, init);
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

  const res = await api('', {
    method: 'POST',
    body: JSON.stringify(reqBody),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  console.log(data);
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return data as RunCodeResponse;
};
