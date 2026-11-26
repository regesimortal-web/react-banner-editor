import { useState, useCallback } from 'react';

type SetStateAction<S> = S | ((prevState: S) => S);
type Dispatch<A> = (value: A) => void;

export const useHistory = <T>(initialState: T): [T, Dispatch<SetStateAction<T>>, () => void, () => void, boolean, boolean] => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((action: SetStateAction<T>) => {
    const currentState = history[currentIndex];
    const nextState = typeof action === 'function' 
      ? (action as (prevState: T) => T)(currentState) 
      : action;
    
    if (JSON.stringify(currentState) === JSON.stringify(nextState)) {
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(nextState);
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return [history[currentIndex], setState, undo, redo, canUndo, canRedo];
};
