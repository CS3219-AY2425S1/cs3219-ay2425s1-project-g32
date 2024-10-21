import {
  type PropsWithChildren,
  type FC,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { getCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

import { Role, type User } from '@/types/user';

export interface SessionData {
  user: Pick<User, 'id' | 'role'>;
  iat: number;
  exp: number;
  accessToken: string;
}

export interface LocalStorageJWT {
  accessToken: string;
}

type SessionContextType = {
  sessionData: SessionData | undefined;
  loading: boolean;
  initAuth: (jwt: LocalStorageJWT) => void;
};

const SessionContext = createContext<SessionContextType>({} as SessionContextType);

export const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [sessionData, setSessionData] = useState<SessionData>();
  const [loading, setLoading] = useState(true);
  const updateAuth = (data: LocalStorageJWT) => {
    const x = jwtDecode<{
      iat: number;
      exp: number;
      id: string;
    }>(data.accessToken);
    setSessionData({
      iat: x.iat,
      exp: x.exp,
      user: {
        id: x.id,
        role: Role.USER,
      },
      accessToken: data.accessToken,
    });
  };
  const initAuth = useCallback((jwt: LocalStorageJWT) => {
    updateAuth(jwt);
  }, []);

  useEffect(() => {
    const value = getCookie('auth');
    // if (typeof window !== 'undefined') {
    // value = localStorage.getItem('auth');
    // }

    if (!value) {
      setSessionData(undefined);
      setLoading(false);
      return;
    }

    const localData = JSON.parse(value) as LocalStorageJWT;
    updateAuth(localData);
  }, []);

  const value = useMemo(
    () => ({ sessionData, loading, initAuth }),
    [sessionData, loading, initAuth]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);

export const getTokenFromLocalStorage = (): string => {
  const jwtCookie = getCookie('auth');
  if (!jwtCookie) {
    return '';
  }
  const jwt = JSON.parse(jwtCookie) as LocalStorageJWT;
  return jwt.accessToken;
};
