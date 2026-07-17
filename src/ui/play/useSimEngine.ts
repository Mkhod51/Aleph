import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  acceptsChar,
  createQuestionStream,
  validate,
  type Question,
  type SessionPlan,
} from '@/engine';
import { now } from '@/lib/timing';
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

export interface SimEngine {
  question: Question;
  input: string;
  index: number; // 0-based position
  correct: number;
  wrong: number;
  onInputChange: (raw: string) => void;
  /** Commit the current answer (Enter). Returns false if a no-skip empty commit. */
  commit: () => void;
  finalizeDrafts: () => AttemptDraft[];
}

/**
 * Test-input play loop for sims (doc 03 §1.1/§3). Answers commit only on Enter,
 * are graded right/wrong with no retry and no per-question feedback. No-skip sims
 * ignore an empty commit; skip-allowed sims record a skip and advance. The stream
 * ends when `count` answers are committed (or the caller's clock expires).
 */
export function useSimEngine(
  plan: SessionPlan,
  count: number,
  skipAllowed: boolean,
  onComplete: () => void,
): SimEngine {
  const streamRef = useRef(createQuestionStream(plan));
  const [question, setQuestion] = useState<Question>(() => streamRef.current.next());
  const [input, setInput] = useState('');
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const attemptsRef = useRef<AttemptDraft[]>([]);
  const renderTimeRef = useRef(now());
  const firstKeyRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    renderTimeRef.current = now();
    firstKeyRef.current = null;
  }, [question]);

  const onInputChange = useCallback(
    (raw: string) => {
      const filtered = filterInput(question, raw);
      if (firstKeyRef.current === null && filtered.length > 0) {
        firstKeyRef.current = now();
      }
      setInput(filtered);
    },
    [question],
  );

  const commit = useCallback(() => {
    if (doneRef.current) return;
    const empty = input.trim() === '';
    if (empty && !skipAllowed) return; // no-skip: Enter on empty does nothing

    const t = now();
    const graded = empty ? { correct: false } : validate(question, input);
    attemptsRef.current.push({
      index,
      skill: question.skill,
      factKey: question.factKey,
      prompt: question.prompt,
      answerCanonical: question.answer.display,
      given: empty ? null : input,
      correct: graded.correct,
      difficulty: question.difficulty,
      firstKeyMs: (firstKeyRef.current ?? t) - renderTimeRef.current,
      totalMs: t - renderTimeRef.current,
      at: Date.now(),
    });
    if (graded.correct) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);

    const nextIndex = index + 1;
    if (nextIndex >= count) {
      doneRef.current = true;
      setIndex(nextIndex);
      onCompleteRef.current();
      return;
    }
    setIndex(nextIndex);
    setInput('');
    setQuestion(streamRef.current.next());
  }, [input, index, question, count, skipAllowed]);

  const finalizeDrafts = useCallback((): AttemptDraft[] => {
    if (doneRef.current) return attemptsRef.current;
    // Clock expired mid-question: log the in-flight question as unanswered.
    const t = now();
    const inflight: AttemptDraft = {
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
    };
    return [...attemptsRef.current, inflight];
  }, [index, question]);

  return { question, input, index, correct, wrong, onInputChange, commit, finalizeDrafts };
}
