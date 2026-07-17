import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Clock } from '@/ui/play/Clock';
import { Countdown } from '@/ui/play/Countdown';
import { PlayField } from '@/ui/play/PlayField';
import { useSimEngine } from '@/ui/play/useSimEngine';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getSim, type SimDef } from '@/content/sims';
import { buildPlanFromSim } from '@/store/sims';
import { finalizeSession, type AttemptDraft } from '@/store/sessionService';
import type { ProfileId } from '@/engine';

type Phase = 'countdown' | 'playing' | 'confirmQuit' | 'ending';

export function SimPlayPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const baseSim = getSim(id);

  // Optional overrides (custom test builder / deterministic tests): count,
  // seconds, seed, profile.
  const overrideSeed = params.get('seed');
  const sim: SimDef | undefined = useMemo(() => {
    if (!baseSim) return undefined;
    const count = params.get('count');
    const seconds = params.get('seconds');
    const profile = params.get('profile') as ProfileId | null;
    return {
      ...baseSim,
      count: count ? Number(count) : baseSim.count,
      durationMs: seconds ? Number(seconds) * 1000 : baseSim.durationMs,
      profile: profile ?? baseSim.profile,
    };
  }, [baseSim, params]);

  const built = useMemo(
    () => (sim ? buildPlanFromSim(sim, overrideSeed ? Number(overrideSeed) : undefined) : null),
    [sim, overrideSeed],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const endedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>(
    settings.countdown ? 'countdown' : 'playing',
  );

  const endSession = useCallback(
    async (completed: boolean, drafts: AttemptDraft[]) => {
      if (endedRef.current || !sim || !built) return;
      endedRef.current = true;
      setPhase('ending');
      const durationMs = completed ? built.durationMs : Math.round(elapsedRef.current);
      try {
        const { sessionId } = await finalizeSession({
          plan: built.plan,
          mode: 'sim',
          simId: sim.id,
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
        console.error('Failed to finalize sim', err);
        navigate('/sims', { replace: true });
      }
    },
    [built, navigate, sim],
  );

  const onCompleteRef = useRef<() => void>(() => {});
  const engine = useSimEngine(
    built?.plan ?? { seed: 0, profile: 'zetamac' },
    sim?.count ?? 0,
    sim?.skip ?? false,
    () => onCompleteRef.current(),
  );
  onCompleteRef.current = () => void endSession(true, engine.finalizeDrafts());

  const beginPlay = useCallback(() => {
    startedAtRef.current = Date.now();
    setPhase('playing');
  }, []);

  // Esc opens a quit confirmation (sims cannot pause, doc 03 §1.2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setPhase((p) =>
        p === 'playing' ? 'confirmQuit' : p === 'confirmQuit' ? 'playing' : p,
      );
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [phase, engine.question]);

  if (!sim || !built) {
    return (
      <div className="py-16 text-center text-text-dim">
        Unknown sim.{' '}
        <button className="text-accent underline" onClick={() => navigate('/sims')}>
          Back to sims
        </button>
      </div>
    );
  }

  const answered = engine.correct + engine.wrong;
  const showClock = phase === 'playing' || phase === 'confirmQuit';

  return (
    <div
      className="flex min-h-[calc(100dvh-2px)] flex-col"
      onClick={() => phase === 'playing' && inputRef.current?.focus()}
    >
      <div className="relative flex h-16 items-center justify-center px-6">
        {showClock && (
          <Clock
            durationMs={built.durationMs}
            running={showClock}
            paused={false} // sims never pause; the clock runs even when hidden
            hidden={false}
            onExpire={() => void endSession(true, engine.finalizeDrafts())}
            onTick={(e) => {
              elapsedRef.current = e;
            }}
          />
        )}
        {showClock && (
          <div className="absolute right-6 font-mono text-lg tabular-nums text-text-dim">
            Q {Math.min(answered + 1, sim.count)}/{sim.count}
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        {phase === 'countdown' && <Countdown onDone={beginPlay} />}
        {phase === 'confirmQuit' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="font-mono text-2xl text-text">Quit this sim?</div>
            <p className="text-sm text-text-dim">
              It will be recorded as abandoned and won&apos;t count.
            </p>
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
                className="rounded-btn border border-bad px-5 py-2 text-text hover:bg-bad-bg"
              >
                Quit
              </button>
            </div>
          </div>
        )}
        {(phase === 'playing' || phase === 'ending') && (
          <PlayField
            question={engine.question}
            input={engine.input}
            onInputChange={engine.onInputChange}
            onSubmit={engine.commit}
            fontSize={settings.questionFontSize}
            inputRef={inputRef}
          />
        )}
      </div>

      {phase === 'playing' && (
        <div className="pb-6 text-center text-xs text-text-dim">
          Enter to submit · Esc to quit
        </div>
      )}
    </div>
  );
}
