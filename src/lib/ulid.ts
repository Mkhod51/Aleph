/**
 * ULID — a 26-char, time-sortable, lexicographically-orderable identifier.
 * 48-bit timestamp (ms) + 80-bit randomness, Crockford base32.
 *
 * Time-sortable so sessions/attempts sort by creation without a separate index,
 * and merge-safe for a future sync backend (doc 08 §8). Monotonic within a
 * millisecond so IDs generated in a tight loop stay unique and ordered.
 */

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's base32
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const TIME_MAX = 2 ** 48 - 1;

function randomDigits(): number[] {
  const out = new Array<number>(RANDOM_LEN);
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(RANDOM_LEN);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < RANDOM_LEN; i++) {
      out[i] = (bytes[i] as number) % ENCODING_LEN;
    }
  } else {
    for (let i = 0; i < RANDOM_LEN; i++) {
      out[i] = Math.floor(Math.random() * ENCODING_LEN);
    }
  }
  return out;
}

/** Increment a base32 digit array by one (with carry) for intra-ms monotonicity. */
function incrementDigits(digits: number[]): number[] {
  const out = digits.slice();
  for (let i = RANDOM_LEN - 1; i >= 0; i--) {
    if ((out[i] as number) < ENCODING_LEN - 1) {
      out[i] = (out[i] as number) + 1;
      return out;
    }
    out[i] = 0; // carry
  }
  return out; // overflow (astronomically unlikely) — wraps
}

function encodeTime(time: number): string {
  let t = time;
  let str = '';
  for (let i = TIME_LEN - 1; i >= 0; i--) {
    const mod = t % ENCODING_LEN;
    str = (ENCODING[mod] as string) + str;
    t = (t - mod) / ENCODING_LEN;
  }
  return str;
}

let lastTime = -1;
let lastDigits: number[] = [];

/** Generate a new ULID. Pass `seedTime` (epoch ms) only for deterministic tests. */
export function ulid(seedTime?: number): string {
  const time = Math.min(seedTime ?? Date.now(), TIME_MAX);
  const digits = time === lastTime ? incrementDigits(lastDigits) : randomDigits();
  lastTime = time;
  lastDigits = digits;
  let rand = '';
  for (const d of digits) rand += ENCODING[d];
  return encodeTime(time) + rand;
}
