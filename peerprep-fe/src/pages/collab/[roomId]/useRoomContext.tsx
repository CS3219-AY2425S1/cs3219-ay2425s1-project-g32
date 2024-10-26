import {
  type PropsWithChildren,
  type FC,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

import { useRouter } from 'next/router';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { useToast } from '@/components/ui/toast/use-toast';
import { useSession } from '@/context/useSession';

import type { User } from '@/types/user';

export interface RoomData {
  user: Pick<User, 'id' | 'role'>;
  iat: number;
  exp: number;
  accessToken: string;
}

export interface LocalStorageJWT {
  accessToken: string;
}

type RoomContextType = {
  otherUser: string;
  provider: WebsocketProvider | null;
  ytext: Y.Text;
};

const RoomContext = createContext<RoomContextType>({} as RoomContextType);

interface State {
  user: {
    name: string;
  };
}

const getOtherUser = (state: Map<number, State>, currentUser: string) => {
  const y = Array.from(state.entries());
  // eslint-disable-next-line no-restricted-syntax
  for (const val of y) {
    const value = val[1];
    if (value.user && value.user.name && value.user.name !== currentUser) {
      return value.user.name;
    }
  }
  return '';
};

const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' },
];

const userColor = usercolors[Math.floor(Math.random() * usercolors.length)];

export const RoomProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { roomId } = router.query;
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [ytext] = useState(() => ydoc.getText('codemirror'));
  const [otherUser, setOtherUser] = useState('');
  const { sessionData } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionData || !roomId) return;

    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_COLLAB_SERVICE_WEBSOCKET_URL as string,
      roomId as string,
      ydoc,
      {
        protocols: [sessionData.accessToken],
      }
    );
    const handleChange = () => {
      setOtherUser(
        getOtherUser(wsProvider.awareness.getStates() as Map<number, State>, sessionData.user.id)
      );
    };

    wsProvider.awareness.setLocalStateField('user', {
      name: sessionData?.user.id || 'Anonymouss',
      color: userColor.color,
      colorLight: userColor.light,
    });

    setOtherUser(
      getOtherUser(wsProvider.awareness.getStates() as Map<number, State>, sessionData.user.id)
    );

    wsProvider.awareness.on('change', handleChange);

    if (wsProvider.ws) {
      wsProvider.ws.onclose = (event) => {
        toast({ variant: 'destructive', description: event.reason });
        // router.push('/');
      };
      setProvider(wsProvider);
    } else {
      toast({ variant: 'destructive', description: 'Something went wrong' });
    }
  }, [roomId, sessionData, toast, ydoc, ytext]);

  const value = useMemo(() => ({ otherUser, provider, ytext }), [otherUser, provider, ytext]);
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => useContext(RoomContext);
