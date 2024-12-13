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

import { useRouter } from 'next/router';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { getRoom } from '@/api/code';
import { getUser } from '@/api/user';
import { useToast } from '@/components/ui/toast/use-toast';
import { useSession } from '@/context/useSession';

import type { Room } from '@/types/room';
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
  room: Room | undefined;
  otherUser: User | null;
  provider: WebsocketProvider | null;
  ytext: Y.Text;
};

const RoomContext = createContext<RoomContextType>({} as RoomContextType);

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
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { sessionData } = useSession();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room>();

  const handle = useCallback(
    async (id: string, accessToken: string) => {
      try {
        if (!id) {
          return;
        }
        const user = await getUser(id, accessToken);
        setOtherUser(user.data);
      } catch (e) {
        toast({ variant: 'destructive', description: 'Error fetching other user data' });
        router.push('/');
      }
    },
    [toast, router]
  );

  useEffect(() => {
    if (!sessionData || !roomId) return;

    (async () => {
      try {
        const room = await getRoom(roomId as string, sessionData.accessToken);
        setRoom(room);
        if (room.user_id1 === sessionData.user.id) {
          handle(room.user_id2, sessionData.accessToken);
        } else {
          handle(room.user_id1, sessionData.accessToken);
        }
      } catch {
        toast({ variant: 'destructive', description: 'Something went wrong' });
        router.push('/');
      }
    })();
  }, [roomId, handle, router, sessionData, toast]);

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

    wsProvider.awareness.setLocalStateField('user', {
      name: sessionData?.user.username || 'Anonymouss',
      color: userColor.color,
      colorLight: userColor.light,
    });

    if (wsProvider.ws) {
      wsProvider.ws.onclose = () => {
        toast({ variant: 'destructive', description: 'Session stopped. Goodbye' });
        router.push('/');
      };
      setProvider(wsProvider);
    } else {
      toast({ variant: 'destructive', description: 'Something went wrong' });
    }
  }, [roomId, sessionData, toast, ydoc, ytext, handle, router]);

  const value = useMemo(
    () => ({ otherUser, room, provider, ytext }),
    [otherUser, provider, ytext, room]
  );
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

export const useRoom = () => useContext(RoomContext);
