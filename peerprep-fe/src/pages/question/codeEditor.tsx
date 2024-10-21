import React, { useEffect, useRef, useState } from 'react';

import { python } from '@codemirror/lang-python';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useRouter } from 'next/router';
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { useToast } from '@/components/ui/toast/use-toast';
import { getTokenFromLocalStorage, useSession } from '@/context/useSession';

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
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ roomId }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line no-unused-vars
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [ytext] = useState(() => ydoc.getText('codemirror'));
  const { sessionData } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = getTokenFromLocalStorage();
    if (!token) return undefined;
    const wsProvider = new WebsocketProvider('ws://localhost:1234', roomId, ydoc, {
      protocols: [token],
    });

    wsProvider.awareness.setLocalStateField('user', {
      name: sessionData?.user.id || 'Anonymous',
      color: userColor.color,
      colorLight: userColor.light,
    });

    if (wsProvider.ws) {
      wsProvider.ws.onclose = () => {
        toast({ variant: 'destructive', description: "You're not allowed in this room." });
        router.push('/');
      };
    }

    setProvider(wsProvider);

    // Initialize the editor only after the component is mounted
    if (editorContainerRef.current) {
      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          keymap.of([...yUndoManagerKeymap]),
          basicSetup,
          python(),
          yCollab(ytext, wsProvider.awareness),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorContainerRef.current,
      });

      return () => {
        wsProvider.disconnect();
        view.destroy();
      };
    }

    return undefined;
  }, [editorContainerRef, ydoc, ytext]);

  return (
    <div
      ref={editorContainerRef}
      style={{ height: '400px', overflow: 'scroll', border: '1px solid lightgray' }}
    />
  );
};

export default CodeMirrorEditor;
