import { useCallback, useState } from 'react';

/**
 * A reusable hook to handle boolean toggle state.
 * @param initialState Optional initial value (default: false).
 * @returns [state, toggleState]
 */
export function useToggle(initialState: boolean = false) {
  const [state, setState] = useState(initialState);

  const toggleState = useCallback(() => {
    setState(prevState => !prevState);
  }, []);

  return [state, toggleState] as const;
}