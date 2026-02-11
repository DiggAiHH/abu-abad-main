/**
 * useToggleMenu: Custom-Hook zur UI-Logik (Einfacher Menu-Zustand).
 */
import { useEffect, useRef, useState } from 'react';

type ToggleReturn = {
  isOpen: boolean;
  toggle: () => void;
  ref: React.RefObject<HTMLElement>;
};

export function useToggleMenu(initialState = false): ToggleReturn {
  const [isOpen, setToggleState] = useState(initialState);
  const ref = useRef<HTMLElement>(null);

  const toggle = () => setToggleState(prev => !prev);

  useEffect(() => {
    if (!isOpen) return;

    const closeMenu = (e: MouseEvent) => {
      if (e.target instanceof Node && !ref.current?.contains(e.target)) {
        setToggleState(false);
      }
    };

    window.addEventListener('mousedown', closeMenu);
    return () => window.removeEventListener('mousedown', closeMenu);
  }, [isOpen]);

  return { isOpen, toggle, ref };
}