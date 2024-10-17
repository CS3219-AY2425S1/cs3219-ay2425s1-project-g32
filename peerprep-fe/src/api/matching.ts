const api = (path: string, init?: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_MATCHING_BACKEND_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export interface MatchingBackendResponse {
  id: string;
}

export interface MatchingPollBackendResponse {
  status: boolean;
}

// Request to perform a matching operation
export const performMatching = async (userId: string, complexity: string, category: string) => {
  const res = await api('match', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      complexity,
      category,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return (data as MatchingBackendResponse).id;
};

export const pollMatchingStatus = async (matchRequestId: string) => {
  const res = await api(`match/poll/${matchRequestId}`);

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return (data as MatchingPollBackendResponse).status;
};
