import React, { useEffect } from 'react';

import CodeEditor from '@/components/codeEditor';

import { useRoom } from './useRoomContext';

interface CodeMirrorEditorProps {
  language: string;
  theme: string;
  onCodeChange: (code: string) => void;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ language, theme, onCodeChange }) => {
  const { provider, ytext } = useRoom();

  useEffect(() => {
    const updateCode = () => {
      onCodeChange(ytext.toString());
    };

    ytext.observe(updateCode);

    return () => {
      ytext.unobserve(updateCode);
    };
  }, [onCodeChange, ytext]);

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
