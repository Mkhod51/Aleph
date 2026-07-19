import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock } from '@/ui/play/Clock';
import { Countdown } from '@/ui/play/Countdown';
import { PauseOverlay } from '@/ui/play/PauseOverlay';
import { PlayField } from '@/ui/play/PlayField';
import { usePlayEngine } from '@/ui/play/usePlayEngine';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  usePresetStore,
  findPreset,
} from '@/store/usePresetStore';
import { buildPlanFromPreset, presetHasAnyOp } from '@/store/presets';
import { finalizeSession } from '@/store/sessionService';

type Phase = 'countdown' | 'playing' | 'paused' | 'ending';

export function PlayPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const settings = useSettingsStore();
  const preset = usePresetStore((s) => findPreset(s.custom, s.selectedId));

  // One plan (and seed) per play session — remounting /play makes a fresh one.
  // `?seconds=` overrides the duration (used by the onboarding 60 s baseline);
  // the override flows into the plan's configHash so the baseline is its own
  // config group and stays out of the default-sprint stats (F2).
  const secondsOverride = params.get('seconds');
  const built = useMemo(() => {
    const n = Number(secondsOverride);
    const overrideMs = secondsOverride && Number.isFinite(n) && n > 0 ? n * 1000 : undefined;
    return buildPlanFromPreset(preset, undefined, overrideMs);
  }, [preset, secondsOverride]);
  const playable = presetHasAnyOp(preset);

  const engine = usePlayEngine(built.plan);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>(
    settings.countdown ? 'countdown' : 'playing',
  );

  const startedAtRef = useRef<number>(Date.now());
  const elapsedRef = useRef(0);
  const endedRef = useRef(false);

  const beginPlay = useCallback(() => {
    // startedAt is when play actually begins (after any countdown).
    startedAtRef.current = Date.now();
    setPhase('playing');
  }, []);

  const endSession = useCallback(
    async (completed: boolean) => {
      if (endedRef.current) return;
      endedRef.current = true;
      setPhase('ending');
      const drafts = engine.finalizeDrafts();
      const durationMs = completed
        ? built.durationMs
        : Math.round(elapsedRef.current);
      try {
        const { sessionId } = await finalizeSession({
          plan: built.plan,
          mode: built.mode,
          configHash: built.configHash,
          scoring: built.scoring,
          extended: built.extended,
          startedAt: startedAtRef.current,
          durationMs,
          completed,
          official: true,
          attempts: drafts,
        });
        navigate(`/results/${sessionId}`, { replace: true });
      } catch (err) {
        console.error('Failed to finalize session', err);
        navigate('/', { replace: true });
      }
    },
    [built, engine, navigate],
  );

  // Esc pauses/resumes (doc 03 §1.2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Tab-hidden auto-pauses sprints so hidden time is excluded (doc 08 §3).
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPhase((p) => (p === 'playing' ? 'paused' : p));
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Keep the input focused while playing.
  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [phase, engine.question]);

  if (!playable) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-text">This preset has no operations enabled.</p>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-btn border border-border px-4 py-2 text-sm text-text-dim hover:border-accent hover:text-text"
        >
          Edit presets
        </button>
      </div>
    );
  }

  const showTopRow = phase === 'playing' || phase === 'paused';

  return (
    <div
      className="flex min-h-[calc(100dvh-2px)] flex-col"
      onClick={() => phase === 'playing' && inputRef.current?.focus()}
    >
      {/* Top row: clock centered, score top-right (both hideable, doc 07 §4) */}
      <div className="relative flex h-16 items-center justify-center px-6">
        {showTopRow && (
          <Clock
            durationMs={built.durationMs}
            running={phase === 'playing' || phase === 'paused'}
            paused={phase === 'paused'}
            hidden={!settings.clockVisible}
            onExpire={() => void endSession(true)}
            onTick={(e) => {
              elapsedRef.current = e;
            }}
          />
        )}
        {showTopRow && settings.scoreVisible && (
          <div
            className="absolute right-6 font-mono text-2xl tabular-nums text-text-dim"
            aria-label="Score"
          >
            {engine.score}
          </div>
        )}
      </div>

      {/* Center stage */}
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
