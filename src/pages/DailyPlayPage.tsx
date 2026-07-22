import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from '@/ui/play/Clock';
import { Countdown } from '@/ui/play/Countdown';
import { PauseOverlay } from '@/ui/play/PauseOverlay';
import { PlayField } from '@/ui/play/PlayField';
import { usePlayEngine } from '@/ui/play/usePlayEngine';
import { useSettingsStore } from '@/store/useSettingsStore';
import { buildDailyPlan, todayKey } from '@/store/daily';
import { finalizeSession } from '@/store/sessionService';

type Phase = 'countdown' | 'playing' | 'paused' | 'ending';

/** Daily challenge — a date-seeded 120 s sprint (doc 03 §5). */
export function DailyPlayPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const built = useMemo(() => buildDailyPlan(todayKey()), []);
  const engine = usePlayEngine(built.plan);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>(settings.countdown ? 'countdown' : 'playing');
  const startedAtRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const endedRef = useRef(false);

  const beginPlay = useCallback(() => {
    startedAtRef.current = Date.now();
    setPhase('playing');
  }, []);

  const endSession = useCallback(
    async (completed: boolean) => {
      if (endedRef.current) return;
      endedRef.current = true;
      setPhase('ending');
      try {
        const { sessionId } = await finalizeSession({
          plan: built.plan,
          mode: 'daily',
          configHash: built.configHash,
          scoring: built.scoring,
          extended: built.extended,
          startedAt: startedAtRef.current,
          durationMs: completed ? built.durationMs : Math.round(elapsedRef.current),
          completed,
          official: true, // finalizeSession recomputes official for daily
          attempts: engine.finalizeDrafts(),
        });
        navigate(`/results/${sessionId}`, { replace: true });
      } catch (err) {
        console.error('Failed to finalize daily', err);
        navigate('/daily', { replace: true });
      }
    },
    [built, engine, navigate],
  );

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

  const showTop = phase === 'playing' || phase === 'paused';

  return (
    <div
      className="flex min-h-[calc(100dvh-2px)] flex-col"
      onClick={() => phase === 'playing' && inputRef.current?.focus()}
    >
      <div className="relative flex h-16 items-center justify-center px-6">
        {showTop && (
          <Clock
            durationMs={built.durationMs}
            running={showTop}
            paused={phase === 'paused'}
            hidden={!settings.clockVisible}
            onExpire={() => void endSession(true)}
            onTick={(e) => {
              elapsedRef.current = e;
            }}
          />
        )}
        {showTop && (
          <div className="absolute left-6 font-mono text-sm text-text-dim">Daily</div>
        )}
        {showTop && settings.scoreVisible && (
          <div className="absolute right-6 readout text-2xl text-text-dim">
            {engine.score}
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        {phase === 'countdown' && <Countdown onDone={beginPlay} />}
        {phase === 'paused' && (
          <PauseOverlay
            onResume={() => setPhase('playing')}
            onQuit={() => void endSession(false)}
          />
        )}
        {(phase === 'playing' || phase === 'ending') && (
          <PlayField
            question={engine.question}
            input={engine.input}
            onInputChange={engine.onInputChange}
            fontSize={settings.questionFontSize}
            inputRef={inputRef}
          />
        )}
      </div>

      {phase === 'playing' && (
        <div className="pb-6 text-center text-xs text-text-dim">Esc to pause</div>
      )}
    </div>
  );
}
