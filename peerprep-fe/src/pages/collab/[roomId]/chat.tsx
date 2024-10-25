/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState, type FC } from 'react';

import Peer, { type MediaConnection } from 'peerjs';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import { useSession } from '@/context/useSession';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const Chat: FC<Props> = () => {
  // eslint-disable-next-line arrow-body-style
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const callingVideoRef = useRef<HTMLVideoElement>(null);

  const [peer, setPeer] = useState<Peer | null>(null);
  const [incomingCall, setIncomingCall] = useState<MediaConnection>();
  const [idToCall, setIdToCall] = useState('');
  const { sessionData } = useSession();

  // Here we declare a function to call the identifier and retrieve
  // its video stream.
  const handleCall = () => {
    if (!peer) return;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        console.log('Calling other guy', peer);
        const call = peer?.call(idToCall, stream);
        console.log(call);
        if (call) {
          call.on('stream', (userVideoStream) => {
            if (callingVideoRef.current) {
              callingVideoRef.current.srcObject = userVideoStream;
            }
          });
        }
      });
  };

  const ready = () => {
    if (!peer) return;
    peer.on('call', (call) => setIncomingCall(call));
  };

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
    <>
      <Dialog open={!!incomingCall}>
        <DialogContent
          // To prevent accidental closure of the dialog when clicking outside bg
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Incoming call from NAMEEEE</DialogTitle>
            <DialogDescription>
              Closing this popup ends the search and you will need to find match again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!incomingCall) return;

                navigator.mediaDevices
                  .getUserMedia({
                    video: true,
                    audio: true,
                  })
                  .then((stream) => {
                    if (myVideoRef.current) {
                      myVideoRef.current.srcObject = stream;
                    }
                    incomingCall.answer(stream);
                    incomingCall.on('stream', (userVideoStream) => {
                      if (callingVideoRef.current) {
                        callingVideoRef.current.srcObject = userVideoStream;
                      }
                    });
                  });
                setIncomingCall(undefined);
              }}
            >
              Accept call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col items-center justify-center p-12">
        <Button onClick={ready}>Ready</Button>
        <p>your id : {sessionData?.user.id}</p>
        <video className="w-72" playsInline ref={myVideoRef} autoPlay />
        <div className="flex items-center gap-x-2">
          <Input
            className="text-black"
            placeholder="Id to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <Button onClick={handleCall}>call</Button>
        </div>
        <video className="w-72" playsInline ref={callingVideoRef} autoPlay />
      </div>
    </>
  );
};

export default Chat;
