import { useRef } from 'react';

import { keymap } from '@codemirror/view';
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next';

import useAutocomplete from './useAutocomplete';
import useCodeFolding from './useCodeFolding';
import { defaultExtensions } from './useDefaultExtensions';
import useIndentation from './useIndentation';
import useLanguageExtension from './useLanguageExtension';
import useLineNumbers from './useLineNumbers';
import useLineWrapping from './useLineWrapping';
import useMatchBrackets from './useMatchBrackets';
import useThemeExtension from './useThemesExtension';

import type { CodeEditorProps } from '.';
import type { Extension } from '@codemirror/state';
import type { EditorView } from 'codemirror';

const useExtensions = (props: CodeEditorProps, editorView: EditorView | null) => {
  const languageExtension = useLanguageExtension(props, editorView);
  const lineNumbersExtension = useLineNumbers(editorView);
  const themeExtension = useThemeExtension(props, editorView);
  const matchBracketExtension = useMatchBrackets(editorView);
  const lineWrappingExtension = useLineWrapping(editorView);
  const codeFoldingExtension = useCodeFolding(editorView);
  const autocompleteExtension = useAutocomplete(editorView);
  const indentationExetension = useIndentation(editorView);

  // console.log("useExtensions", editorSettings);

  // Store as a ref because the extensions themselves are stored in compartments that won't change. We don't need to rebuild this array every time it re-renders.
  const extensionsRef = useRef([
    keymap.of([...yUndoManagerKeymap]),
    yCollab(props.ytext, props.websocketProvider.awareness),
    // Order for Emmet & default is important to allow `tab` key indentation to work.
    defaultExtensions,

    // Order can affect gutter layout and cascade precedence.
    languageExtension,
    lineNumbersExtension,
    themeExtension,
    matchBracketExtension,
    lineWrappingExtension,
    codeFoldingExtension,
    autocompleteExtension,
    indentationExetension,
  ]);

  return extensionsRef.current as Extension;
};

export default useExtensions;
