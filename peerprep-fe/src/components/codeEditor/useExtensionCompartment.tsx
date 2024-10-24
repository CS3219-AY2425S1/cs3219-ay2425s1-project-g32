import { useMemo, useCallback } from 'react';

import { Compartment, type Extension } from '@codemirror/state';

import type { EditorView } from 'codemirror';

const useExtensionCompartment = (editorView: EditorView | null) => {
  const compartment = useMemo(() => new Compartment(), []);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const dispatch = editorView?.dispatch;
  const updateCompartment = useCallback(
    function updateCompartment(extension: Extension) {
      if (dispatch)
        dispatch({
          effects: compartment.reconfigure(extension),
        });
    },
    [compartment, dispatch]
  );

  return [
    // Initial value of [] to prevent extension errors
    compartment.of([]),
    updateCompartment,
  ];
};

export default useExtensionCompartment;
