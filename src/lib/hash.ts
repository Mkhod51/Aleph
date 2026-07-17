import { xmur3 } from './prng';

/**
 * Stable, order-independent JSON serialization: object keys are sorted so two
 * structurally-equal configs hash identically regardless of key order.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

/** 32-bit hash of a string, rendered as a fixed-width base36 token. */
export function hashString(str: string): string {
  return (xmur3(str)() >>> 0).toString(36).padStart(7, '0');
}

/** Stable hash of any JSON-serializable value (used for configHash grouping). */
export function stableHash(value: unknown): string {
  return hashString(stableStringify(value));
}
