import { type FC, type PropsWithChildren, type ReactElement, useEffect, cloneElement } from 'react';

import { useRouter } from 'next/router';

import { type SessionData, useSession } from '@/context/useSession';
import { Role, type User } from '@/types/user';

import { useToast } from './ui/toast/use-toast';

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

  if (config.role === Role.ADMIN && user.isAdmin) return true;

  return config.role === user.role;
};

const AuthGuard: FC<PropsWithChildren<Props>> = ({ children, config }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { sessionData, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (!sessionData) {
      toast({ variant: 'destructive', description: 'You need to be signed in' });
      void router.push({
        pathname: '/auth/signin',
        query: {
          error: 'SessionRequired',
          callbackUrl: router.asPath,
        },
      });

      return;
    }
    console.log(sessionData);
    if (
      config.role === Role.ADMIN &&
      !sessionData.user.isAdmin &&
      sessionData.user.role === Role.USER
    ) {
      void router.push({
        pathname: '/403',
      });
    }
  }, [sessionData, router, loading, config, toast]);

  // Prevent type error when returning children by itself without fragments
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (canVisit(sessionData?.user, config))
    return <>{cloneElement(children, { user: sessionData?.user })}</>;

  return (
    <div className="mt-44 flex flex-col items-center">
      <div className="font-bold">Authenticating your account...</div>
    </div>
  );
};

export default AuthGuard;
