const api = (path: string, init?: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_MATCHING_BACKEND_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export interface MatchingBackendResponse {
  id: string;
}

export enum PollStatus {
  MATCHING = 'matching',
  MATCHED = 'matched',
  CANCELLED = 'cancelled',
}

export interface MatchingPollBackendResponse {
  status: string;
}

// Request to perform a matching operation
export const performMatching = async (complexity: string, category: string, token: string) => {
  const res = await api('match', {
    method: 'POST',
    body: JSON.stringify({
      complexity,
      category,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  return (data as MatchingBackendResponse).id;
};

export const pollMatchingStatus = async (matchRequestId: string, token: string) => {
  const res = await api(`match/poll/${matchRequestId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }

  const { status } = data as MatchingPollBackendResponse;

  if (Object.values(PollStatus).includes(status as PollStatus)) {
    return status as PollStatus;
  }

  throw Error('error occured');
};

export const cancelMatch = async (matchId: string, token: string) => {
  const res = await api('match', {
    method: 'POST',
    body: JSON.stringify({
      matchId,
    }),
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
