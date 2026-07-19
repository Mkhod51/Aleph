import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  acceptsChar,
  matchesLive,
  nextAdaptiveRating,
  targetMsForTag,
  tierFromRating,
  validate,
  ADAPTIVE_START,
  type Question,
} from '@/engine';
import { mulberry32, type Rng } from '@/lib/prng';
import { now as timeNow } from '@/lib/timing';
import {
  drawDrillQuestion,
  resolveDrillWeights,
  type DrillMeta,
} from '@/store/drills';
import type { AttemptDraft } from '@/store/sessionService';

function filterInput(q: Question, raw: string): string {
  let out = '';
  for (const ch of raw) {
    if (!acceptsChar(q, ch)) continue;
    if (ch === '-' && out.length > 0) continue;
    if (ch === '.' && out.includes('.')) continue;
    if (ch === '/' && out.includes('/')) continue;
    out += ch;
  }
  return out;
}

export type Feedback = 'none' | 'good' | 'bad';

export interface DrillEngine {
  question: Question;
  input: string;
  index: number;
  correct: number;
  feedback: Feedback;
  missAnswer: string | null;
  onInputChange: (raw: string) => void;
  commit: () => void;
  finalizeDrafts: () => AttemptDraft[];
}

/**
 * Drill play loop (doc 03 §4). Count-based; supports flow input (auto-advance)
 * and test input (Enter-commit with optional 300 ms feedback flash + 1.2 s
 * answer-on-miss). Adaptive tiers re-compute from a per-drill rating after each
 * answer (doc 04 §7).
 */
export function useDrillEngine(meta: DrillMeta, onComplete: () => void): DrillEngine {
  const genRngRef = useRef<Rng>(mulberry32(meta.seed));
  const resolvedRef = useRef(resolveDrillWeights(meta.weights));
  const ratingRef = useRef(ADAPTIVE_START);
  const recentRef = useRef<string[]>([]);
  // Pinned fact drills share one factKey across every question, so factKey-based
  // anti-repeat would collapse the whole drill; key on the prompt instead so the
  // three forms and neighbors vary while identical prompts still don't repeat (F1).
  const pinnedRef = useRef(
    !!meta.configs && Object.values(meta.configs).some((c) => c?.pinPair),
  );

  const makeNext = useCallback((): Question => {
    const tier =
      meta.tierMode === 'adaptive' ? tierFromRating(ratingRef.current) : meta.tierMode;
    const gen = () => drawDrillQuestion(genRngRef.current, resolvedRef.current, tier, meta.configs);
    let q = gen();
    let tries = 0;
    const key = (x: Question) =>
      pinnedRef.current ? `p:${x.prompt}` : (x.factKey ?? `p:${x.prompt}`);
    // Anti-repeat window of 8, matching the sprint stream (doc 04 §4, F9).
    while (recentRef.current.includes(key(q)) && tries < 5) {
      q = gen();
      tries++;
    }
    recentRef.current.push(key(q));
    if (recentRef.current.length > 8) recentRef.current.shift();
    return q;
  }, [meta.tierMode, meta.configs]);

  const [question, setQuestion] = useState<Question>(() => makeNext());
  const [input, setInput] = useState('');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [missAnswer, setMissAnswer] = useState<string | null>(null);

  const attemptsRef = useRef<AttemptDraft[]>([]);
  const renderTimeRef = useRef(timeNow());
  const firstKeyRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const advancingRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    renderTimeRef.current = timeNow();
    firstKeyRef.current = null;
  }, [question]);

  const record = useCallback(
    (given: string | null, isCorrect: boolean, t: number) => {
      attemptsRef.current.push({
        index,
        skill: question.skill,
        factKey: question.factKey,
        prompt: question.prompt,
        answerCanonical: question.answer.display,
        given,
        correct: isCorrect,
        difficulty: question.difficulty,
        firstKeyMs: (firstKeyRef.current ?? t) - renderTimeRef.current,
        totalMs: t - renderTimeRef.current,
        at: Date.now(),
      });
      // Adaptive rating update (doc 04 §7).
      const fast = isCorrect && t - renderTimeRef.current < targetMsForTag(question.skill);
      ratingRef.current = nextAdaptiveRating(ratingRef.current, { correct: isCorrect, fast });
    },
    [index, question],
  );

  const advance = useCallback(() => {
    const nextIndex = index + 1;
    setFeedback('none');
    setMissAnswer(null);
    setInput('');
    if (nextIndex >= meta.count) {
      doneRef.current = true;
      setIndex(nextIndex);
      onCompleteRef.current();
      return;
    }
    setIndex(nextIndex);
    setQuestion(makeNext());
  }, [index, meta.count, makeNext]);

  const onInputChange = useCallback(
    (raw: string) => {
      if (advancingRef.current) return;
      const filtered = filterInput(question, raw);
      if (firstKeyRef.current === null && filtered.length > 0) firstKeyRef.current = timeNow();

      if (meta.input === 'flow') {
        if (matchesLive(question, filtered)) {
          const t = timeNow();
          record(filtered, true, t);
          setCorrect((c) => c + 1);
          advance();
          return;
        }
      }
      setInput(filtered);
    },
    [question, meta.input, record, advance],
  );

  const commit = useCallback(() => {
    if (meta.input !== 'test' || advancingRef.current || doneRef.current) return;
    if (input.trim() === '') return; // no empty commit
    const t = timeNow();
    const graded = validate(question, input);
    record(input, graded.correct, t);
    if (graded.correct) setCorrect((c) => c + 1);

    if (!meta.feedback) {
      advance();
      return;
    }
    // Feedback flash: 300 ms color; on a miss, show the answer for 1.2 s.
    advancingRef.current = true;
    setFeedback(graded.correct ? 'good' : 'bad');
    if (!graded.correct) setMissAnswer(question.answer.display);
    const delay = graded.correct ? 300 : 1200;
    setTimeout(() => {
      advancingRef.current = false;
      advance();
    }, delay);
  }, [meta.input, meta.feedback, input, question, record, advance]);

  const finalizeDrafts = useCallback((): AttemptDraft[] => {
    if (doneRef.current) return attemptsRef.current;
    const t = timeNow();
    return [
      ...attemptsRef.current,
      {
        index,
        skill: question.skill,
        factKey: question.factKey,
        prompt: question.prompt,
        answerCanonical: question.answer.display,
        given: null,
        correct: false,
        difficulty: question.difficulty,
        firstKeyMs: (firstKeyRef.current ?? t) - renderTimeRef.current,
        totalMs: t - renderTimeRef.current,
        at: Date.now(),
      },
    ];
  }, [index, question]);

  return {
    question,
    input,
    index,
    correct,
    feedback,
    missAnswer,
    onInputChange,
    commit,
    finalizeDrafts,
  };
}
