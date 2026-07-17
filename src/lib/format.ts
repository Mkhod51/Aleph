/** Display formatting for clocks, latencies and stats (doc 07 §2/§4). */

/** Milliseconds → a compact duration label, "30s" / "2m" (doc 03 §2 durations). */
export function durationLabel(ms: number): string {
  return ms < 60000 ? `${Math.round(ms / 1000)}s` : `${Math.round(ms / 60000)}m`;
}

/** Milliseconds → "m:ss" clock, floored to the second, clamped at 0. */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Milliseconds → "4.1s" (one decimal); sub-second stays in seconds too. */
export function formatLatency(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

/** A 0..1 accuracy → "88.7%". */
export function formatAccuracy(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Throughput → "8.9/min". */
export function formatPerMin(perMin: number): string {
  return `${perMin.toFixed(1)}/min`;
}

/** Signed integer delta → "+7" / "−3" / "±0" (true minus sign for display). */
export function formatSignedDelta(n: number): string {
  if (n === 0) return '±0';
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

/** YYYY-MM-DD for the given epoch ms in local time. */
export function localDateKey(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}
