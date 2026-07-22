import { useEffect, useRef, useState } from 'react';
import { now, rafLoop } from '@/lib/timing';

interface GameClockOptions {
  durationMs: number;
  running: boolean; // false during countdown / after end
  paused: boolean; // Esc pause or tab-hidden
  onExpire: () => void;
  /** Called each active frame with elapsed ms, lets the page read elapsed
   *  (for finalize) via a ref without re-rendering the play field. */
  onTick?: (elapsedMs: number) => void;
}

/**
 * A pause-aware session clock (doc 08 §3). Elapsed time is measured from
 * `performance.now()` deltas via requestAnimationFrame, never accumulated
 * setInterval ticks, so it cannot drift. Paused/hidden time is excluded.
 *
 * Isolated in its own component (see Clock.tsx) so its ~60fps re-renders don't
 * touch the prompt/input. Fires `onExpire` exactly once when elapsed ≥ duration;
 * the caller finalizes the in-flight question as unanswered.
 */
export function useGameClock({
  durationMs,
  running,
  paused,
  onExpire,
  onTick,
}: GameClockOptions): { remainingMs: number; elapsedMs: number } {
  const [elapsedMs, setElapsedMs] = useState(0);

  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // Reset when a new run starts.
  useEffect(() => {
    if (!running) return;
    startRef.current = now();
    pausedAtRef.current = null;
    pausedTotalRef.current = 0;
    expiredRef.current = false;
    setElapsedMs(0);
  }, [running]);

  // Track pause boundaries so paused time is excluded from elapsed.
  useEffect(() => {
    if (!running) return;
    if (paused) {
      if (pausedAtRef.current === null) pausedAtRef.current = now();
    } else if (pausedAtRef.current !== null) {
      pausedTotalRef.current += now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [paused, running]);

  useEffect(() => {
    if (!running) return;
    const stop = rafLoop((t) => {
      if (startRef.current === null) return;
      if (pausedAtRef.current !== null) return; // frozen while paused
      const elapsed = t - startRef.current - pausedTotalRef.current;
      setElapsedMs(elapsed);
      onTickRef.current?.(elapsed);
      if (!expiredRef.current && elapsed >= durationMs) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    });
    return stop;
  }, [running, durationMs]);

  return { remainingMs: Math.max(0, durationMs - elapsedMs), elapsedMs };
}
