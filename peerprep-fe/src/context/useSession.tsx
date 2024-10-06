import {
  type PropsWithChildren,
  type FC,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { User } from '@/types/user';

export enum Status {
  LOADING = 'loading',
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATED = 'authenticated',
}

export interface SessionData {
  user: User;
}

type SessionContextType = {
  status: Status;
  sessionData: SessionData | undefined;
};

const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<Status>(Status.UNAUTHENTICATED);
  const [sessionData, setSessionData] = useState<SessionData>();
  const value = useMemo(() => ({ status, sessionData }), [status, sessionData]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);
