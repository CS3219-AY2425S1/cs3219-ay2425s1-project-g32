import { useEffect } from 'react';

import { autocompletion } from '@codemirror/autocomplete';

import useExtensionCompartment from './useExtensionCompartment';

import type { Extension } from '@codemirror/state';
import type { EditorView } from 'codemirror';

const useAutocomplete = (editorView: EditorView | null) => {
  const [compartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    (updateCompartment as (ext: Extension) => void)(autocompletion());
  }, [updateCompartment]);

  return compartment;
};

export default useAutocomplete;
