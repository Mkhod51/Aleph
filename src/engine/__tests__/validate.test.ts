import { describe, it, expect } from 'vitest';
import { validate, matchesLive, acceptsChar } from '../validate';
import type { AnswerFormat, Question } from '../types';

function q(
  format: AnswerFormat,
  value: number,
  display?: string,
): Question {
  return {
    skill: 'ADD_2D',
    prompt: 'test',
    operands: [],
    answer: { value, display: display ?? String(value) },
    format,
    difficulty: 1,
    factKey: null,
  };
}

describe('flow-input live matching (doc 04 §6, §10.4)', () => {
  it('integer: advances only on a complete numeric match', () => {
    const q391 = q('integer', 391);
    expect(matchesLive(q391, '3')).toBe(false);
    expect(matchesLive(q391, '39')).toBe(false); // prefix, not a match
    expect(matchesLive(q391, '391')).toBe(true);
    expect(matchesLive(q391, '3910')).toBe(false);
  });

  it('integer: single-digit and leading-zero-of-a-longer-answer cases', () => {
    expect(matchesLive(q('integer', 5), '5')).toBe(true);
    const q50 = q('integer', 50);
    expect(matchesLive(q50, '5')).toBe(false);
    expect(matchesLive(q50, '50')).toBe(true);
  });

  it('integer: a trailing dot is treated as an incomplete prefix, never a match', () => {
    expect(matchesLive(q('integer', 12), '12.')).toBe(false);
  });

  it('integer: empty / lone-minus do not match', () => {
    expect(matchesLive(q('integer', 3), '')).toBe(false);
    expect(matchesLive(q('integer', 3), '-')).toBe(false);
  });

  it('integer: whitespace is ignored', () => {
    expect(matchesLive(q('integer', 42), ' 42 ')).toBe(true);
  });

  it('decimal: full-value match with the 0.5 vs 0.55 prefix edge', () => {
    const half = q('decimal', 0.5, '0.5');
    expect(matchesLive(half, '0.5')).toBe(true);
    expect(matchesLive(half, '0.55')).toBe(false);
    expect(matchesLive(half, '.5')).toBe(true); // .5 ≡ 0.5
    expect(matchesLive(half, '0.50')).toBe(true); // trailing zeros ok

    const bigger = q('decimal', 0.55, '0.55');
    expect(matchesLive(bigger, '0.5')).toBe(false); // must not advance early
    expect(matchesLive(bigger, '0.55')).toBe(true);
    expect(matchesLive(bigger, '0.5')).toBe(false);
  });

  it('choice: keys 1/2 match directly', () => {
    const choice = q('choice', 1, '1');
    expect(matchesLive(choice, '1')).toBe(true);
    expect(matchesLive(choice, '2')).toBe(false);
  });
});

describe('committed grading (doc 04 §6)', () => {
  it('integer: trailing dot / trailing zeros are ignored', () => {
    expect(validate(q('integer', 12), '12.').correct).toBe(true);
    expect(validate(q('integer', 12), '12.0').correct).toBe(true);
    expect(validate(q('integer', 12), '13').correct).toBe(false);
  });

  it('decimal: numeric equality with trailing zeros and leading dot', () => {
    const half = q('decimal', 0.5, '0.5');
    expect(validate(half, '0.50').correct).toBe(true);
    expect(validate(half, '.5').correct).toBe(true);
    expect(validate(half, '0.500').correct).toBe(true);
    expect(validate(half, '0.6').correct).toBe(false);
  });

  it('accepts a leading minus and normalizes', () => {
    const neg = q('integer', -3);
    expect(validate(neg, '-3').correct).toBe(true);
    expect(validate(neg, ' -3 ').normalized).toBe('-3');
  });

  it('rejects non-numeric junk', () => {
    expect(validate(q('integer', 3), 'abc').correct).toBe(false);
    expect(validate(q('integer', 3), '').correct).toBe(false);
    expect(validate(q('integer', 3), '3x').correct).toBe(false);
  });

  it('choice grades by the display key', () => {
    expect(validate(q('choice', 2, '2'), '2').correct).toBe(true);
    expect(validate(q('choice', 2, '2'), '1').correct).toBe(false);
  });
});

describe('multi / fraction grading (doc 04 §6)', () => {
  const threeQuarters: Question = {
    skill: 'FRAC_ADD',
    prompt: '1/4 + 1/2',
    operands: [],
    answer: { value: 0.75, display: '3/4', fraction: { num: 3, den: 4 } },
    format: 'multi',
    difficulty: 5,
    factKey: null,
  };

  it('accepts exact, unreduced, decimal, and mixed forms', () => {
    expect(validate(threeQuarters, '3/4').correct).toBe(true);
    expect(validate(threeQuarters, '6/8').correct).toBe(true); // unreduced
    expect(validate(threeQuarters, '0.75').correct).toBe(true); // decimal
    expect(validate(threeQuarters, '1/2').correct).toBe(false);
  });

  it('accepts mixed numbers', () => {
    const oneAndThreeQuarters: Question = {
      ...threeQuarters,
      answer: { value: 1.75, display: '1 3/4', fraction: { num: 7, den: 4 } },
    };
    expect(validate(oneAndThreeQuarters, '1 3/4').correct).toBe(true);
    expect(validate(oneAndThreeQuarters, '7/4').correct).toBe(true);
    expect(validate(oneAndThreeQuarters, '1.75').correct).toBe(true);
  });
});

describe('repeating decimal grading (doc 04 §6)', () => {
  const oneSixth: Question = {
    skill: 'FRAC_TO_DEC',
    prompt: '1/6 ≈',
    operands: [1, 6],
    answer: { value: 1 / 6, display: '0.1667', approx: true },
    format: 'decimal',
    difficulty: 6,
    factKey: 'frac:1/6',
  };

  it('accepts both 2-dp and 4-dp rounded forms, rejects far answers', () => {
    expect(validate(oneSixth, '0.17').correct).toBe(true);
    expect(validate(oneSixth, '0.1667').correct).toBe(true);
    expect(validate(oneSixth, '0.166').correct).toBe(true);
    expect(validate(oneSixth, '0.2').correct).toBe(false);
    expect(validate(oneSixth, '0.15').correct).toBe(false);
  });
});

describe('acceptsChar (doc 07 §5 input filtering)', () => {
  it('integer accepts digits and minus, not dot or slash', () => {
    const qi = q('integer', 1);
    expect(acceptsChar(qi, '7')).toBe(true);
    expect(acceptsChar(qi, '-')).toBe(true);
    expect(acceptsChar(qi, '.')).toBe(false);
    expect(acceptsChar(qi, '/')).toBe(false);
    expect(acceptsChar(qi, 'a')).toBe(false);
  });

  it('decimal accepts dot; fraction/multi accept slash', () => {
    expect(acceptsChar(q('decimal', 1), '.')).toBe(true);
    expect(acceptsChar(q('decimal', 1), '/')).toBe(false);
    expect(acceptsChar(q('multi', 1), '/')).toBe(true);
    expect(acceptsChar(q('fraction', 1), '/')).toBe(true);
  });

  it('choice accepts only 1 and 2', () => {
    const qc = q('choice', 1, '1');
    expect(acceptsChar(qc, '1')).toBe(true);
    expect(acceptsChar(qc, '2')).toBe(true);
    expect(acceptsChar(qc, '3')).toBe(false);
  });
});
