import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayField } from '@/ui/play/PlayField';
import { useDrillEngine } from '@/ui/play/useDrillEngine';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useDrillStore } from '@/store/drills';
import { finalizeSession, type AttemptDraft } from '@/store/sessionService';
import type { SessionPlan } from '@/engine';

type Phase = 'playing' | 'paused' | 'ending';

export function DrillPlayPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const meta = useDrillStore((s) => s.pending);

  const inputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef(Date.now());
  const endedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>('playing');

  const endSession = useCallback(
    async (completed: boolean, drafts: AttemptDraft[]) => {
      if (endedRef.current || !meta) return;
      endedRef.current = true;
      setPhase('ending');
      const plan: SessionPlan = {
        seed: meta.seed,
        profile: meta.weights,
        count: meta.count,
      };
      try {
        const { sessionId } = await finalizeSession({
          plan,
          mode: 'drill',
          configHash: meta.configHash,
          scoring: meta.scoring,
          extended: false,
          startedAt: startedAtRef.current,
          durationMs: Date.now() - startedAtRef.current,
          completed,
          official: true,
          attempts: drafts,
        });
        navigate(`/results/${sessionId}`, { replace: true });
      } catch (err) {
        console.error('Failed to finalize drill', err);
        navigate('/drills', { replace: true });
      }
    },
    [meta, navigate],
  );

  const onCompleteRef = useRef<() => void>(() => {});
  const engine = useDrillEngine(
    meta ?? {
      title: '',
      weights: {},
      seed: 0,
      count: 0,
      input: 'flow',
      feedback: false,
      tierMode: 'adaptive',
      configHash: '',
      scoring: { kind: 'count' },
    },
    () => onCompleteRef.current(),
  );
  onCompleteRef.current = () => void endSession(true, engine.finalizeDrafts());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [phase, engine.question]);

  if (!meta) {
    return (
      <div className="py-16 text-center text-text-dim">
        No drill configured.{' '}
        <button className="text-accent underline" onClick={() => navigate('/drills')}>
          Choose a drill
        </button>
      </div>
    );
  }

  const flashBg =
    engine.feedback === 'good'
      ? 'bg-good-bg'
      : engine.feedback === 'bad'
        ? 'bg-bad-bg'
        : '';

  return (
    <div
      className={`flex min-h-[calc(100dvh-2px)] flex-col transition-colors duration-150 ${flashBg}`}
      onClick={() => phase === 'playing' && inputRef.current?.focus()}
    >
      <div className="relative flex h-16 items-center justify-center px-6">
        {phase !== 'ending' && (
          <>
            <div className="font-mono text-sm text-text-dim">{meta.title}</div>
            <div className="absolute right-6 font-mono text-lg tabular-nums text-text-dim">
              {Math.min(engine.index + 1, meta.count)}/{meta.count}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-16">
        {phase === 'paused' ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="font-mono text-3xl text-text">Paused</div>
            <div className="flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setPhase('playing')}
                className="rounded-btn bg-accent px-5 py-2 font-medium text-bg hover:brightness-110"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => void endSession(false, engine.finalizeDrafts())}
                className="rounded-btn border border-border px-5 py-2 text-text-dim hover:border-bad hover:text-text"
              >
                Quit
              </button>
            </div>
          </div>
        ) : (
          <>
            <PlayField
              question={engine.question}
              input={engine.input}
              onInputChange={engine.onInputChange}
              onSubmit={meta.input === 'test' ? engine.commit : undefined}
              fontSize={settings.questionFontSize}
              inputRef={inputRef}
            />
            {engine.missAnswer && (
              <div className="font-mono text-lg text-bad">
                answer: <span className="text-text">{engine.missAnswer}</span>
              </div>
            )}
          </>
        )}
      </div>

      {phase === 'playing' && (
        <div className="pb-6 text-center text-xs text-text-dim">
          {meta.input === 'test' ? 'Enter to submit · ' : ''}Esc to pause
        </div>
      )}
    </div>
  );
}
