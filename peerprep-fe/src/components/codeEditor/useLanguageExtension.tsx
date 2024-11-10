import { useEffect } from 'react';

import { languages } from '@codemirror/language-data';

import useExtensionCompartment from './useExtensionCompartment';

import type { CodeEditorProps } from '.';
import type { Extension } from '@codemirror/state';
import type { EditorView } from 'codemirror';

function getCodeMirrorLanguageData(language: string) {
  const languageData = languages.find(
    (lang) => lang.name === language || lang.alias.includes(language)
  );

  return languageData;
}

const useLanguageExtension = ({ language }: CodeEditorProps, editorView: EditorView | null) => {
  const [languageCompartment, updateCompartment] = useExtensionCompartment(editorView);

  useEffect(() => {
    async function loadLanguage() {
      const lang = getCodeMirrorLanguageData(language);

      if (lang) {
        const languageExtension = await lang.load();
        (updateCompartment as (ext: Extension) => void)(languageExtension);
      }
    }

    loadLanguage();
  }, [language, updateCompartment]);

  return languageCompartment as Extension;
};

export default useLanguageExtension;
