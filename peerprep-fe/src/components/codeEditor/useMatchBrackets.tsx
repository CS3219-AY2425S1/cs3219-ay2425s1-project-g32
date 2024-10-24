import { useEffect } from 'react';

import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching } from '@codemirror/language';
import { type EditorView, keymap } from '@codemirror/view';

import useExtensionCompartment from './useExtensionCompartment';

import type { Extension } from '@codemirror/state';

const useMatchBrackets = (editorView: EditorView | null) => {
  const [compartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    (updateCompartment as (ext: Extension) => void)([
      bracketMatching(),
      closeBrackets(),
      keymap.of(closeBracketsKeymap),
    ]);
  }, [updateCompartment]);

  return compartment;
};

export default useMatchBrackets;
