import { useEffect } from 'react';

import { EditorView } from 'codemirror';

import useExtensionCompartment from './useExtensionCompartment';

import type { Extension } from '@codemirror/state';

const useLineWrapping = (editorView: EditorView | null) => {
  const [compartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    (updateCompartment as (ext: Extension) => void)(EditorView.lineWrapping);
  }, [updateCompartment]);

  return compartment;
};

export default useLineWrapping;
