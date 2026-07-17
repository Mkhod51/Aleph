import { describe, it, expect } from 'vitest';
import { ulid } from '../ulid';
import { stableHash, stableStringify } from '../hash';

describe('ulid', () => {
  it('is 26 chars of Crockford base32', () => {
    const id = ulid();
    expect(id).toHaveLength(26);
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('is lexicographically time-sortable', () => {
    const early = ulid(1000);
    const late = ulid(2000);
    expect(early < late).toBe(true);
  });

  it('is monotonic within the same millisecond', () => {
    const t = 1_700_000_000_000;
    const ids = Array.from({ length: 50 }, () => ulid(t));
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
    expect(new Set(ids).size).toBe(ids.length); // all unique
  });
});

describe('stable hashing (configHash grouping, doc 05 §1)', () => {
  it('is independent of key order', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
    expect(stableHash({ b: 1, a: [2, { d: 4, c: 3 }] })).toBe(
      stableHash({ a: [2, { c: 3, d: 4 }], b: 1 }),
    );
  });

  it('differs for different content', () => {
    expect(stableHash({ a: 1 })).not.toBe(stableHash({ a: 2 }));
  });
});
