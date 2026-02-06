import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY = 50;

export const useUndoRedo = <T>(initialState: T): UseUndoRedoReturn<T> => {
  const [state, setStateInternal] = useState<T>(initialState);
  const historyRef = useRef<T[]>([initialState]);
  const indexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setStateInternal((prev: T) => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;
      
      if (!isUndoRedoRef.current) {
        // Remove any future history if we're not at the end
        historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
        
        // Add new state to history
        historyRef.current.push(nextState);
        
        // Limit history size
        if (historyRef.current.length > MAX_HISTORY) {
          historyRef.current = historyRef.current.slice(-MAX_HISTORY);
        }
        
        indexRef.current = historyRef.current.length - 1;
      }
      
      return nextState;
    });
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      isUndoRedoRef.current = true;
      setStateInternal(historyRef.current[indexRef.current]);
      isUndoRedoRef.current = false;
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      isUndoRedoRef.current = true;
      setStateInternal(historyRef.current[indexRef.current]);
      isUndoRedoRef.current = false;
    }
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [state];
    indexRef.current = 0;
  }, [state]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    clear,
  };
};
