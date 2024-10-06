import type { SessionData } from '@/context/useSession';
import type { GetServerSidePropsContext, PreviewData } from 'next';
import type { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

// eslint-disable-next-line import/prefer-default-export
export const getServerAuthSession: (
  context: GetServerSidePropsContext<Params, PreviewData>
) => Promise<SessionData | null> = async () => {
  return new Promise((resolve) => {
    resolve(null);
  });
};
