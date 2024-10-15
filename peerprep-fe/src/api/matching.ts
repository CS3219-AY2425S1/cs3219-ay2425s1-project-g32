import type { Matching } from '@/types/matching';
import type { Poll } from '@/types/poll';

const api = (path: string, init: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_MATCHING_BACKEND_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export interface MatchingBackendResponse extends BaseResponse {
  data: Matching;
}

export interface MatchingPollBackendResponse extends BaseResponse {
  data: Poll;
}

// Request to perform a matching operation
export const performMatching = async (user_id: string, complexity: string, category: string) => {
  const res = await api('match', {
    method: 'POST',
    body: JSON.stringify({
      user_id,
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
  return data as MatchingBackendResponse;
};

export const pollMatchingStatus = async(matchRequest_id: string) => {
  const res = await api('poll', {
    method: 'POST',
    body: JSON.stringify({
      matchRequest_id
    }), 
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as MatchingPollBackendResponse;
}
