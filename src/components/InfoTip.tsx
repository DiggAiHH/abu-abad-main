import { useEffect, useId, useRef } from 'react';
import { useToggle } from '../hooks/useToggle';
import { Info } from 'lucide-react';

interface InfoTipProps {
  label: string;
  title?: string;
  children: string;
}

export function InfoTip({ label, title, children }: InfoTipProps): JSX.Element {
  const [open, toggleOpen] = useToggle(false);
  const id = useId();
  const panelId = `${id}-panel`;
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  return (
    <span ref={containerRef} className='relative inline-flex items-center'>
      <button
        type='button'
        aria-label={label} aria-describedby={title}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleOpen}
        className='ms-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <Info className='h-4 w-4' />
      </button>

      {open && (
        <div
          id={panelId}
          role='tooltip'
          aria-label={title ?? label}
          className='absolute right-0 top-8 z-50 w-80 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg'
        >
          {title && <div className='mb-1 font-semibold text-gray-900'>{title}</div>}
          <div className='leading-snug'>{children}</div>
        </div>
      )}
    </span>
  );
}