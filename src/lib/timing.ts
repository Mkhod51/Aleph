/**
 * Time source and animation-frame helpers for the play loop (doc 08 §3).
 *
 * The clock is driven by `performance.now()` deltas rendered via
 * requestAnimationFrame — never by accumulating setInterval ticks (which drift).
 * The pause-aware session clock that builds on these lands with Sprint mode (M1).
 */

/** High-resolution monotonic time in milliseconds. */
export function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/** Milliseconds elapsed since a `now()` timestamp. */
export function elapsedSince(start: number): number {
  return now() - start;
}

/**
 * Run `cb(nowMs)` every animation frame until the returned function is called.
 * Falls back to a ~60fps timer where rAF is unavailable (e.g. tests).
 */
export function rafLoop(cb: (nowMs: number) => void): () => void {
  const raf =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (fn: FrameRequestCallback) =>
          setTimeout(() => fn(now()), 16) as unknown as number;
  const caf =
    typeof cancelAnimationFrame === 'function'
      ? cancelAnimationFrame
      : (id: number) => clearTimeout(id);

  let handle = 0;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    cb(now());
    handle = raf(tick);
  };
  handle = raf(tick);

  return () => {
    stopped = true;
    caf(handle);
  };
}
