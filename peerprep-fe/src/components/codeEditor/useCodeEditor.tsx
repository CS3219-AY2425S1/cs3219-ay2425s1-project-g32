import { useEffect, useRef, useState } from 'react';

import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

import useExtensions from './useExtensions';

import type { CodeEditorProps } from '.';

const useCodeEditor = (props: CodeEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  const extensions = useExtensions(props, editorView);

  // Initialize CodeMirror6 View
  useEffect(() => {
    const editorState = EditorState.create({
      doc: props.ytext.toString(),
      extensions,
    });

    const editorView = new EditorView({
      state: editorState,
      parent: ref.current || undefined,
    });

    // NOTE: State is available as `editorView.state`
    setEditorView(editorView);

    // Destroy when unmounted.
    return () => editorView.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const value = props.ytext.toString();
    const validValue = value || value === '';
    if (!editorView || !validValue) return;

    const currentValue = editorView.state.doc.toString();
    if (value !== currentValue) {
      // https://codemirror.net/docs/migration/#making-changes
      // NOTE: "To completely reset a state—for example to load a new document—it is recommended to create a new state instead of a transaction. That will make sure no unwanted state (such as undo history events) sticks around."
      // editorView.setState(EditorState.create())
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: value },
      });
    }
  }, [editorView, props.ytext]);

  return { ref };
};

export default useCodeEditor;
