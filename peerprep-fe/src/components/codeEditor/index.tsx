import { type FC } from 'react';

import useCodeEditor from './useCodeEditor';

import type { WebsocketProvider } from 'y-websocket';
import type * as Y from 'yjs';

export interface CodeEditorProps {
  language: string;
  editorSettings: unknown;
  ytext: Y.Text;
  websocketProvider: WebsocketProvider;
  theme: string;
}

const CodeEditor: FC<CodeEditorProps> = (props) => {
  const cmProps = useCodeEditor(props);
  return <div key="codemirror-6-instance" style={{ height: '100%' }} {...cmProps} />;
};

export default CodeEditor;
