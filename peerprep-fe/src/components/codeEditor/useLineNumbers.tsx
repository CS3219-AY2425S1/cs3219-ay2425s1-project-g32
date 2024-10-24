import { useEffect } from 'react';

import { type EditorView, lineNumbers } from '@codemirror/view';

import useExtensionCompartment from './useExtensionCompartment';

import type { Extension } from '@codemirror/state';

const useLineNumbers = (editorView: EditorView | null) => {
  const [compartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    (updateCompartment as (ext: Extension) => void)(lineNumbers());
  }, [updateCompartment]);

  return compartment;
};

export default useLineNumbers;
