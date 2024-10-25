import React, { useEffect, useState } from 'react';

// import { useRouter } from 'next/router';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import CodeEditor from '@/components/codeEditor';
import { useToast } from '@/components/ui/toast/use-toast';
import { useSession } from '@/context/useSession';

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

interface CodeMirrorEditorProps {
  roomId: string;
  language: string;
  theme: string;
  onCodeChange: (code: string) => void;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  roomId,
  language,
  theme,
  onCodeChange,
}) => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [ytext] = useState(() => ydoc.getText('codemirror'));
  const { sessionData } = useSession();
  // const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const updateCode = () => {
      onCodeChange(ytext.toString());
    };

    ytext.observe(updateCode);

    return () => {
      ytext.unobserve(updateCode);
    };
  }, [onCodeChange, ytext]);

  useEffect(() => {
    if (!sessionData || !roomId) return;

    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_COLLAB_SERVICE_WEBSOCKET_URL as string,
      roomId,
      ydoc,
      {
        protocols: [sessionData.accessToken],
      }
    );

    wsProvider.awareness.setLocalStateField('user', {
      name: sessionData?.user.id || 'Anonymouss',
      color: userColor.color,
      colorLight: userColor.light,
    });

    if (wsProvider.ws) {
      wsProvider.ws.onclose = (event) => {
        console.log(event);
        toast({ variant: 'destructive', description: "Yous're not allowed in this room." });
        // router.push('/');
      };
      setProvider(wsProvider);
    } else {
      console.log('Seomthing wrong seems to be happening');
    }
  }, [roomId, sessionData, toast, ydoc, ytext]);

  return (
    provider && (
      <CodeEditor
        theme={theme}
        websocketProvider={provider}
        ytext={ytext}
        language={language}
        editorSettings={undefined}
      />
    )
  );
};

export default CodeMirrorEditor;
