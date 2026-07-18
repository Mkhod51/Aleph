import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acceptsChar, matchesLive, type Question } from '@/engine';
import { now } from '@/lib/timing';
import { gradeCard, loadDueCards, seedBuiltinDecks } from '@/store/srs';
import type { SrsCard } from '@/store/types';

/** A card rendered as a minimal Question for the shared matcher. */
function asQuestion(card: SrsCard): Question {
  return {
    skill: 'ADD_2D',
    prompt: card.front,
    operands: [],
    answer: card.answer,
    format: card.format,
    difficulty: 1,
    factKey: null,
  };
}

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

export function SrsReviewPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SrsCard[] | null>(null);
  const [i, setI] = useState(0);
  const [input, setInput] = useState('');
  const [reviewed, setReviewed] = useState(0);
  const [reveal, setReveal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renderRef = useRef(now());
  const busyRef = useRef(false);

  useEffect(() => {
    let alive = true;
    seedBuiltinDecks()
      .then(() => loadDueCards())
      .then((c) => alive && setCards(c));
    return () => {
      alive = false;
    };
  }, []);

  const card = cards?.[i];

  useLayoutEffect(() => {
    renderRef.current = now();
    setInput('');
    inputRef.current?.focus();
  }, [i]);

  const advance = useCallback(() => {
    setReveal(null);
    setI((n) => n + 1);
  }, []);

  const onChange = useCallback(
    (raw: string) => {
      if (!card || busyRef.current) return;
      const q = asQuestion(card);
      const filtered = filterInput(q, raw);
      setInput(filtered);
      if (matchesLive(q, filtered)) {
        busyRef.current = true;
        void gradeCard(card, true, now() - renderRef.current).then(() => {
          busyRef.current = false;
          setReviewed((n) => n + 1);
          advance();
        });
      }
    },
    [card, advance],
  );

  const onReveal = useCallback(() => {
    if (!card || busyRef.current) return;
    busyRef.current = true;
    void gradeCard(card, false, Infinity).then(() => {
      setReviewed((n) => n + 1);
      setReveal(card.answer.display);
      setTimeout(() => {
        busyRef.current = false;
        advance();
      }, 1500);
    });
  }, [card, advance]);

  if (!cards) return <p className="py-16 text-center text-text-dim">Loading review…</p>;

  if (cards.length === 0 || i >= cards.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-mono text-2xl font-semibold text-text">
          {reviewed > 0 ? 'Review complete' : 'All caught up'}
        </h1>
        <p className="mt-3 text-text-dim">
          {reviewed > 0
            ? `${reviewed} card${reviewed === 1 ? '' : 's'} reviewed. Come back tomorrow.`
            : 'No cards are due right now.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 rounded-btn border border-border px-4 py-2 text-sm text-text-dim hover:border-accent hover:text-text"
        >
          ← Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[70dvh] flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex h-12 items-center justify-center font-mono text-sm text-text-dim">
        {i + 1}/{cards.length} · box {card?.box}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="font-mono text-6xl tabular-nums text-text">{card?.front}</div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-label="Your answer"
          className="w-56 rounded-card border border-border bg-surface px-4 py-3 text-center font-mono text-4xl tabular-nums text-text caret-accent outline-none focus:border-accent"
        />
        {reveal ? (
          <div className="font-mono text-lg text-bad">
            answer: <span className="text-text">{reveal}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onReveal}
            className="text-sm text-text-dim hover:text-text"
          >
            Reveal (counts as a miss)
          </button>
        )}
      </div>
    </div>
  );
}
