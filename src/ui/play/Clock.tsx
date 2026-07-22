import { formatClock } from '@/lib/format';
import { useGameClock } from './useGameClock';

/**
 * The countdown clock, top-center and dim (doc 07 §4). Isolated so its ~60fps
 * re-renders never touch the prompt/input. When hidden it still runs the timer
 * (so the session still ends), it just renders nothing visible.
 */
export function Clock({
  durationMs,
  running,
  paused,
  hidden,
  onExpire,
  onTick,
}: {
  durationMs: number;
  running: boolean;
  paused: boolean;
  hidden: boolean;
  onExpire: () => void;
  onTick: (elapsedMs: number) => void;
}) {
  const { remainingMs } = useGameClock({ durationMs, running, paused, onExpire, onTick });

  if (hidden) return null;

  return (
    <div
      className="readout text-2xl text-text-dim"
      aria-label="Time remaining"
      role="timer"
    >
      {formatClock(remainingMs)}
    </div>
  );
}
