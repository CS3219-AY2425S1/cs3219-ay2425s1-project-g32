/* eslint-disable-next-line import/prefer-default-export */
export async function api<T>(path: string, requestInit?: RequestInit): Promise<T> {
  const response = await fetch(path, requestInit);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  //    And can also be used here ↴
  return (await response.json()) as T;
}
