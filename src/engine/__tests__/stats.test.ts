import { describe, it, expect } from 'vitest';
import {
  rollingAverage,
  trendDirection,
  masteryLevel,
  isWeakFact,
  quartileAccuracy,
  fatigueDelta,
  targetMsForTag,
} from '../stats';

describe('rollingAverage (doc 05 §2)', () => {
  it('averages the last N (default 7)', () => {
    expect(rollingAverage([])).toBe(0);
    expect(rollingAverage([10, 20, 30])).toBe(20);
    expect(rollingAverage([1, 2, 3, 4, 5, 6, 7, 8], 7)).toBe(5); // mean 2..8
  });
});

describe('trendDirection (doc 05 §2)', () => {
  it('is null until 14 sessions exist', () => {
    expect(trendDirection(Array(13).fill(50))).toBeNull();
  });
  it('detects improvement and decline over consecutive rolling-7 windows', () => {
    const improving = [...Array(7).fill(40), ...Array(7).fill(60)];
    expect(trendDirection(improving)).toBe(1);
    const declining = [...Array(7).fill(60), ...Array(7).fill(40)];
    expect(trendDirection(declining)).toBe(-1);
    expect(trendDirection(Array(14).fill(50))).toBe(0);
  });
});

describe('masteryLevel (doc 05 §2)', () => {
  const target = 5000;
  it('— under 10 attempts', () => {
    expect(masteryLevel({ attempts: 9, accuracy: 1, medianLatencyMs: 100, targetMs: target })).toBe('—');
  });
  it('learning when inaccurate or slow', () => {
    expect(masteryLevel({ attempts: 20, accuracy: 0.8, medianLatencyMs: 100, targetMs: target })).toBe('learning');
    expect(masteryLevel({ attempts: 20, accuracy: 0.99, medianLatencyMs: 6000, targetMs: target })).toBe('learning');
  });
  it('solid when accurate and within target', () => {
    expect(masteryLevel({ attempts: 20, accuracy: 0.9, medianLatencyMs: 4000, targetMs: target })).toBe('solid');
  });
});

describe('isWeakFact (doc 03 §6)', () => {
  it('needs at least 3 attempts', () => {
    expect(isWeakFact({ attempts: 2, accuracy: 0, medianLatencyMs: 9999, referenceMedianMs: 1000 })).toBe(false);
  });
  it('weak on low accuracy', () => {
    expect(isWeakFact({ attempts: 5, accuracy: 0.6, medianLatencyMs: 100, referenceMedianMs: 1000 })).toBe(true);
  });
  it('weak on slow latency vs 1.5× reference', () => {
    expect(isWeakFact({ attempts: 5, accuracy: 1, medianLatencyMs: 1600, referenceMedianMs: 1000 })).toBe(true);
    expect(isWeakFact({ attempts: 5, accuracy: 1, medianLatencyMs: 1400, referenceMedianMs: 1000 })).toBe(false);
  });
});

describe('fatigue (doc 05 §2)', () => {
  it('quartile accuracy splits by index', () => {
    const correct = [true, true, true, true, false, false, false, false];
    const q = quartileAccuracy(correct);
    expect(q).toEqual([1, 1, 0, 0]);
    expect(fatigueDelta(correct)).toBe(-1);
  });
});

describe('targetMsForTag (doc 04 §7)', () => {
  it('maps families to target times', () => {
    expect(targetMsForTag('ADD_2D')).toBe(4000);
    expect(targetMsForTag('MUL_1x2')).toBe(5000);
    expect(targetMsForTag('MUL_2x2')).toBe(8000);
    expect(targetMsForTag('SQUARE')).toBe(3000);
    expect(targetMsForTag('PCT_OF')).toBe(6000);
  });
});
