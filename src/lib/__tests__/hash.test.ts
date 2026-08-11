import { describe, it, expect } from 'vitest';
import { hashString, stableStringify, stableHash } from '../hash';

describe('hashString', () => {
  it('is a fixed-width base36 token, left-padded to 7 chars', () => {
    expect(hashString('aleph')).toMatch(/^[0-9a-z]{7}$/);
    // A hash whose natural base36 length is < 7 still pads.
    expect(hashString('').length).toBe(7);
  });

  it('is deterministic for the same input', () => {
    expect(hashString('config::zetamac')).toBe(hashString('config::zetamac'));
  });

  it('differs for different inputs', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('stableStringify (key-order independent, array-order preserving)', () => {
  it('sorts object keys so order does not matter', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it('preserves array order (only object keys are sorted, not sequences)', () => {
    expect(stableStringify([3, 1, 2])).toBe('[3,1,2]');
    expect(stableStringify([3, 1, 2])).not.toBe(stableStringify([1, 2, 3]));
  });

  it('passes primitives and null through unchanged', () => {
    expect(stableStringify(5)).toBe('5');
    expect(stableStringify('hi')).toBe('"hi"');
    expect(stableStringify(null)).toBe('null');
  });
});

describe('stableHash', () => {
  it('is order-independent and content-sensitive', () => {
    expect(stableHash({ a: 1, b: 2 })).toBe(stableHash({ b: 2, a: 1 }));
    expect(stableHash({ a: 1 })).not.toBe(stableHash({ a: 2 }));
  });
});
