import type { Question } from '@/types/question';

const api = (path: string, init?: RequestInit) => {
  return fetch(`${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/${path}`, init);
};

export interface BaseResponse {
  message: string;
}

export const getQuestions = async (complexity: string, category: string) => {
  const queryParams = [];
  queryParams.push('sample_input=defaultValue');
  queryParams.push('sample_output=defaultValue');

  if (complexity) {
    queryParams.push(`complexity=${complexity}`);
  }

  if (category) {
    queryParams.push(`category=${category}`);
  }

  const path = `question/${queryParams.length ? `?${queryParams.join('&')}` : ''}`;

  const res = await api(path);
  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as Question[];
};

export const getQuestion = async (id: string) => {
  const res = await api(`question/${id}`);
  const data: unknown = await res.json();
  if (!res.ok) {
    throw Error((data as BaseResponse).message);
  }
  return data as Question;
};
