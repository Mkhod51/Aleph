import { describe, it, expect } from 'vitest';
import {
  durationLabel,
  formatClock,
  formatLatency,
  formatAccuracy,
  formatPerMin,
  formatSignedDelta,
  localDateKey,
} from '../format';

describe('durationLabel (doc 03 §2)', () => {
  it('renders sub-minute durations in seconds', () => {
    expect(durationLabel(0)).toBe('0s');
    expect(durationLabel(29_600)).toBe('30s'); // rounds
    expect(durationLabel(59_999)).toBe('60s');
  });

  it('renders minute+ durations in minutes', () => {
    expect(durationLabel(60_000)).toBe('1m');
    expect(durationLabel(120_000)).toBe('2m');
  });
});

describe('formatClock', () => {
  it('formats as m:ss, floored to the second', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(59_999)).toBe('0:59');
    expect(formatClock(60_000)).toBe('1:00');
    expect(formatClock(125_000)).toBe('2:05'); // zero-padded seconds
  });

  it('clamps negative elapsed time to 0:00', () => {
    expect(formatClock(-5_000)).toBe('0:00');
  });
});

describe('formatLatency / formatAccuracy / formatPerMin', () => {
  it('latency is seconds with one decimal', () => {
    expect(formatLatency(4_100)).toBe('4.1s');
    expect(formatLatency(0)).toBe('0.0s');
  });

  it('accuracy is a one-decimal percent', () => {
    expect(formatAccuracy(0.887)).toBe('88.7%');
    expect(formatAccuracy(1)).toBe('100.0%');
  });

  it('per-minute is one decimal over "/min"', () => {
    expect(formatPerMin(8.94)).toBe('8.9/min');
  });
});

describe('formatSignedDelta', () => {
  it('uses + for gains, a true minus for losses, and ±0 for nil', () => {
    expect(formatSignedDelta(7)).toBe('+7');
    expect(formatSignedDelta(-3)).toBe('−3'); // U+2212, not a hyphen
    expect(formatSignedDelta(0)).toBe('±0');
    expect(formatSignedDelta(-3)).not.toBe('-3'); // guard against a plain hyphen
  });
});

describe('localDateKey', () => {
  it('formats the local calendar date as YYYY-MM-DD', () => {
    // Local noon avoids any DST / midnight boundary surprises across runner TZs.
    const noon = new Date(2026, 0, 5, 12, 0, 0).getTime();
    expect(localDateKey(noon)).toBe('2026-01-05');
    expect(localDateKey(noon)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
