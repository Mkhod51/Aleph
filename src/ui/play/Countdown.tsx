import { useEffect, useState } from 'react';

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * 3-2-1 countdown, skippable with Enter/click (doc 03 §1.2). Under reduced
 * motion it becomes a static "Ready?" prompt (doc 07 §7).
 */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    if (REDUCED_MOTION) return; // wait for Enter/click instead of auto-advancing
    if (n <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setN((v) => v - 1), 700);
    return () => clearTimeout(id);
  }, [n, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDone();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    <button
      type="button"
      onClick={onDone}
      className="flex min-h-[12rem] w-full flex-col items-center justify-center gap-2"
      aria-label="Start now"
    >
      {REDUCED_MOTION ? (
        <>
          <div className="font-mono text-4xl text-text">Ready?</div>
          <div className="text-sm text-text-dim">Enter to start</div>
        </>
      ) : (
        <>
          <div className="font-mono text-7xl tabular-nums text-accent">
            {n > 0 ? n : 'GO'}
          </div>
          <div className="text-sm text-text-dim">Enter to skip</div>
        </>
      )}
    </button>
  );
}
