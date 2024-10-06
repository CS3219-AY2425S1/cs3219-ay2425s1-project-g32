import { type FC, type PropsWithChildren, type ReactElement, useEffect, cloneElement } from 'react';

import { useRouter } from 'next/router';

import { useSession } from '@/context/useSession';
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
  user: User | undefined,
  config: AuthEnabledComponentConfig['authenticationEnabled']
): boolean => {
  if (!user) return false;

  if (config.role === Role.USER) return true;

  return config.role === user.role;
};

const AuthGuard: FC<PropsWithChildren<Props>> = ({ children, config }) => {
  const router = useRouter();
  const { sessionData, status } = useSession();

  const user = sessionData?.user;
  useEffect(() => {
    if (status === 'loading') return;

    if (!user) {
      void router.push({
        pathname: '/auth/signin',
        query: {
          error: 'SessionRequired',
          callbackUrl: router.asPath,
        },
      });

      return;
    }
    if (config.role === Role.ADMIN && user.role === Role.USER) {
      void router.push({
        pathname: '/403',
      });
    }
  }, [user, router, status, config]);

  // Prevent type error when returning children by itself without fragments
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (canVisit(user, config)) return <>{cloneElement(children, { user })}</>;

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
