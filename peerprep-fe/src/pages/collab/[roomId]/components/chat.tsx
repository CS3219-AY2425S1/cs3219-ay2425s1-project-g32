/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useMemo, useRef, useState } from 'react';

import { Phone, PhoneOff, VideoOff } from 'lucide-react';
import Peer, { type MediaConnection } from 'peerjs';

import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading/loading';
import Separator from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/context/useSession';

import { useRoom } from '../useRoom';

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

  const height = useMemo(() => (state !== VideoState.AVAILABLE ? 'h-72 border' : ''), [state]);

  return (
    <div
      className={`${height} flex w-full items-center justify-center overflow-hidden rounded-lg shadow-lg`}
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
  const [call, setCall] = useState<MediaConnection>();
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

    // TODO: Timeout and cancel loading?
    setOtherVideoState(VideoState.LOADING);
    const call = peer.call(otherUser.id, stream);
    if (call) {
      call.on('stream', (userVideoStream) => {
        setOtherVideoState(VideoState.AVAILABLE);
        setOtherVideoStream(userVideoStream);
      });

      call.on('close', () => {
        setOtherVideoState(VideoState.UNAVAILABLE);
      });
    } else {
      toast({ variant: 'destructive', description: 'Somethign went wrong with the server' });
      setOtherVideoState(VideoState.UNAVAILABLE);
    }
    setCall(call);
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
      peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (userVideoStream) => {
          setOtherVideoState(VideoState.AVAILABLE);
          setOtherVideoStream(userVideoStream);
        });
        call.on('close', () => {
          setOtherVideoState(VideoState.UNAVAILABLE);
        });
      });
    } catch (e) {
      console.error('Error accessing camera/mic:', e);
      toast({ variant: 'destructive', description: 'unable to turn on your camera/mic' });
      return;
    }
    setReady(true);
  };

  const onEndCall = () => {
    if (!call || !peer) return;
    call.off('stream');
    peer.off('call');
    peer.emit('close');
    call.emit('close');
    call.close();
    setCall(undefined);
    setOtherVideoState(VideoState.UNAVAILABLE);
  };

  // Connect to chat
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (sessionData) {
      let peerInstance: Peer;
      if (typeof window !== 'undefined') {
        peerInstance = new Peer(sessionData.user.id, {
          host: 'backend.34.126.92.100.nip.io',
          path: '/signaling',
          port: 443,
          secure: true,
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
        <div className="flex gap-x-2">
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
          <Button
            disabled={!call}
            size="sm"
            variant="outline"
            onClick={onEndCall}
            className="bg-red-500 text-white"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            username: <strong>{sessionData?.user.username}</strong>
          </div>
          <Video stream={myVideoStream} state={myVideoState} />
        </div>
        <Separator />
        <div className="flex flex-col gap-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            username: <strong>{otherUser?.username || 'Not in room'}</strong>
          </div>
          <Video stream={otherVideoStream} state={otherVideoState} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
