import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  acceptsChar,
  createQuestionStream,
  matchesLive,
  type Question,
  type SessionPlan,
} from '@/engine';
import { now } from '@/lib/timing';
import type { AttemptDraft } from '@/store/sessionService';

/** Keep only characters valid for the answer format, one `-`/`.`/`/` each. */
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

export interface PlayEngine {
  question: Question;
  input: string;
  score: number;
  onInputChange: (raw: string) => void;
  /** All buffered correct attempts plus the in-flight question as unanswered. */
  finalizeDrafts: () => AttemptDraft[];
}

/**
 * Flow-input play loop (doc 03 §1.1, doc 08 §3). A single controlled input;
 * every keystroke normalizes + live-matches; on match the question advances
 * instantly with no "wrong" state. Attempts buffer in memory, zero DB writes
 * during the loop. Latency (firstKeyMs/totalMs) is captured via refs so it never
 * causes a re-render.
 */
export function usePlayEngine(plan: SessionPlan): PlayEngine {
  const streamRef = useRef(createQuestionStream(plan));
  const [question, setQuestion] = useState<Question>(() => streamRef.current.next());
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);

  const attemptsRef = useRef<AttemptDraft[]>([]);
  const indexRef = useRef(0);
  const renderTimeRef = useRef(now());
  const firstKeyRef = useRef<number | null>(null);

  // Reset per-question timing right after the new prompt paints.
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

      if (matchesLive(question, filtered)) {
        const t = now();
        attemptsRef.current.push({
          index: indexRef.current++,
          skill: question.skill,
          factKey: question.factKey,
          prompt: question.prompt,
          answerCanonical: question.answer.display,
          given: filtered,
          correct: true,
          difficulty: question.difficulty,
          firstKeyMs: (firstKeyRef.current ?? t) - renderTimeRef.current,
          totalMs: t - renderTimeRef.current,
          at: Date.now(),
        });
        setScore((s) => s + 1);
        setInput('');
        setQuestion(streamRef.current.next());
        return;
      }

      setInput(filtered);
    },
    [question],
  );

  const finalizeDrafts = useCallback((): AttemptDraft[] => {
    const t = now();
    const inflight: AttemptDraft = {
      index: indexRef.current,
      skill: question.skill,
      factKey: question.factKey,
      prompt: question.prompt,
      answerCanonical: question.answer.display,
      given: null, // in-flight question finalized as unanswered (doc 08 §3)
      correct: false,
      difficulty: question.difficulty,
      firstKeyMs: (firstKeyRef.current ?? t) - renderTimeRef.current,
      totalMs: t - renderTimeRef.current,
      at: Date.now(),
    };
    return [...attemptsRef.current, inflight];
  }, [question]);

  return { question, input, score, onInputChange, finalizeDrafts };
}
