import { type FC, type PropsWithChildren, type ReactElement, useEffect, cloneElement } from 'react';

import { useRouter } from 'next/router';

import { type SessionData, useSession } from '@/context/useSession';
import { Role, type User } from '@/types/user';

/**
 * Authentication configuration
 */
export interface AuthEnabledComponentConfig {
  authenticationEnabled: {
    role: Role;
  };
}

/**
 * A component with authentication configuration
 */
export type ComponentWithAuth<PropsType = Record<never, never>> = React.FC<
  PropsType & { user: User }
> &
  AuthEnabledComponentConfig;

interface Props {
  children: ReactElement;
  config: AuthEnabledComponentConfig['authenticationEnabled'];
}

export const canVisit = (
  user: SessionData['user'] | undefined,
  config: AuthEnabledComponentConfig['authenticationEnabled']
): boolean => {
  if (!user) return false;

  if (config.role === Role.USER) return true;

  return config.role === user.role;
};

const AuthGuard: FC<PropsWithChildren<Props>> = ({ children, config }) => {
  const router = useRouter();
  const { sessionData, loading } = useSession();

  useEffect(() => {
    if (loading) return;

    if (!sessionData) {
      void router.push({
        pathname: '/auth/signin',
        query: {
          error: 'SessionRequired',
          callbackUrl: router.asPath,
        },
      });

      return;
    }
    if (config.role === Role.ADMIN && sessionData.user.role === Role.USER) {
      void router.push({
        pathname: '/403',
      });
    }
  }, [sessionData, router, loading, config]);

  // Prevent type error when returning children by itself without fragments
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (canVisit(sessionData?.user, config))
    return <>{cloneElement(children, { user: sessionData?.user })}</>;

  return (
    <div className="mt-44 flex flex-col items-center">
      {/* <Image
        src={`${env.NEXT_PUBLIC_S3_BUCKET_URL}/public/icons/progress.svg`}
        alt="Loading..."
        width={100}
        height={100}
      /> */}
      <div className="font-bold">Authenticating your account...</div>
    </div>
  );
};

export default AuthGuard;
