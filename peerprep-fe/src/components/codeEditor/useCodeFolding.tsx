import { useEffect } from 'react';

import { codeFolding, foldGutter, foldKeymap } from '@codemirror/language';
import { type EditorView, keymap } from '@codemirror/view';

import useExtensionCompartment from './useExtensionCompartment';

import type { Extension } from '@codemirror/state';

const useCodeFolding = (editorView: EditorView | null) => {
  const [compartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    (updateCompartment as (ext: Extension) => void)([
      // https://codemirror.net/docs/ref/#language.codeFolding
      codeFolding(),
      keymap.of(foldKeymap),
      // https://codemirror.net/docs/ref/#language.foldGutter
      foldGutter(),
    ]);
  }, [updateCompartment]);

  return compartment;
};

export default useCodeFolding;
