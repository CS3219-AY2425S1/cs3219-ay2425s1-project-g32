/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useMemo, useRef, useState } from 'react';

import { Phone, VideoOff } from 'lucide-react';
import Peer from 'peerjs';

import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading/loading';
import { useToast } from '@/components/ui/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/context/useSession';

import { useRoom } from './useRoomContext';

enum VideoState {
  LOADING,
  UNAVAILABLE,
  AVAILABLE,
}

const Video = ({ state, stream }: { state: VideoState; stream: MediaStream | undefined }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [component, setComponent] = useState<JSX.Element | null>(null);
  useEffect(() => {
    if (stream && ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  useMemo(() => {
    switch (state) {
      case VideoState.LOADING: {
        setComponent(<Loading />);
        break;
      }
      case VideoState.AVAILABLE: {
        setComponent(<video playsInline ref={ref} autoPlay />);
        break;
      }
      case VideoState.UNAVAILABLE: {
        setComponent(<VideoOff className="text-gray-400" />);
        break;
      }
      default: {
        setComponent(null);
        break;
      }
    }
  }, [state]);

  return (
    <div
      className={`${
        state !== VideoState.AVAILABLE ? 'h-72' : ''
      } flex w-full items-center justify-center rounded-lg border shadow-lg`}
    >
      {component}
    </div>
  );
};

const Chat = () => {
  const [myVideoStream, setMyVideoStream] = useState<MediaStream>();
  const [otherVideoStream, setOtherVideoStream] = useState<MediaStream>();
  const [ready, setReady] = useState(false);
  const [myVideoState, setMyVideoState] = useState(VideoState.UNAVAILABLE);
  const [otherVideoState, setOtherVideoState] = useState(VideoState.UNAVAILABLE);
  const [peer, setPeer] = useState<Peer | null>(null);
  const { sessionData } = useSession();
  const { otherUser } = useRoom();
  const { toast } = useToast();

  // Here we declare a function to call the identifier and retrieve
  // its video stream.
  const onInitiateCall = async () => {
    if (!peer || !otherUser) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    peer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (userVideoStream) => {
        setOtherVideoState(VideoState.AVAILABLE);
        setOtherVideoStream(userVideoStream);
      });
    });
    // TODO: Timeout and cancel loading?
    setOtherVideoState(VideoState.LOADING);
    const call = peer.call(otherUser, stream);
    if (call) {
      call.on('stream', (userVideoStream) => {
        setOtherVideoState(VideoState.AVAILABLE);
        setOtherVideoStream(userVideoStream);
      });
    } else {
      toast({ variant: 'destructive', description: 'User not ready yet' });
    }
  };

  const onReady = async () => {
    if (!peer) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyVideoState(VideoState.AVAILABLE);
      setMyVideoStream(stream);
    } catch (e) {
      toast({ variant: 'destructive', description: 'unable to turn on your camera/mic' });
      return;
    }

    setReady(true);
  };

  // Connect to chat
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (sessionData) {
      let peerInstance: Peer;
      if (typeof window !== 'undefined') {
        peerInstance = new Peer(sessionData.user.id, {
          host: 'localhost',
          port: 9000,
          path: '/signaling',
        });

        setPeer(peerInstance);
      }

      return () => {
        if (peer) {
          peer.destroy();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-between gap-x-2">
        <Button size="sm" className="text-xs" onClick={onReady}>
          Enable Camera/Mic
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button disabled={!ready} size="sm" variant="outline" onClick={onInitiateCall}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </TooltipTrigger>
            {!ready && <TooltipContent>You need to enable camera and mic first</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <div className="text-sm font-medium text-foreground">
            username: <strong>{sessionData?.user.username}</strong>
          </div>
          <Video stream={myVideoStream} state={myVideoState} />
        </div>
        <div className="h-[1px] w-full bg-gray-300" />
        <div className="flex flex-col gap-y-2">
          <div className="text-sm font-medium text-foreground">
            username: <strong>{otherUser || 'Not in room'}</strong>
          </div>
          <Video stream={otherVideoStream} state={otherVideoState} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
