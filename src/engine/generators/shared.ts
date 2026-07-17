import type { Canonical } from '../types';

/** Symbol for a missing operand (doc 07 / doc 04 §3). */
export const BLANK = '□';

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export interface Frac {
  num: number;
  den: number;
}

/** Reduce to lowest terms with a positive denominator. */
export function reduceFraction(num: number, den: number): Frac {
  const g = gcd(num, den);
  const sign = den < 0 ? -1 : 1;
  return { num: (sign * num) / g, den: (sign * den) / g };
}

/** Format an exact value to a decimal string, trimming trailing zeros. */
export function formatDecimal(value: number, maxDp = 4): string {
  let s = value.toFixed(maxDp);
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s === '-0' ? '0' : s;
}

/** Canonical for a decimal answer computed exactly upstream (integer-scaled). */
export function decimalCanonical(value: number, maxDp = 4): Canonical {
  const display = formatDecimal(value, maxDp);
  return { value: Number(display), display };
}

/** Display a fraction in lowest terms as "3/8" or a mixed "1 3/4" (or an integer). */
export function fractionDisplay(num: number, den: number): string {
  const r = reduceFraction(num, den);
  if (r.den === 1) return String(r.num);
  if (Math.abs(r.num) >= r.den) {
    const sign = r.num < 0 ? '-' : '';
    const whole = Math.trunc(Math.abs(r.num) / r.den);
    const rem = Math.abs(r.num) % r.den;
    return rem === 0 ? `${sign}${whole}` : `${sign}${whole} ${rem}/${r.den}`;
  }
  return `${r.num}/${r.den}`;
}

/** Canonical for a fraction answer (multi format: decimal OR fraction accepted). */
export function fractionCanonical(num: number, den: number): Canonical {
  const r = reduceFraction(num, den);
  return {
    value: r.num / r.den,
    display: fractionDisplay(r.num, r.den),
    fraction: { num: r.num, den: r.den },
  };
}
