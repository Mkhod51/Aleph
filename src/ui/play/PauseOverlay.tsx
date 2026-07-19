import { Button } from '@/ui/Button';

/**
 * Pause overlay (doc 03 §1.2). The clock is frozen and the question is hidden to
 * prevent free thinking time. Resume or quit (quitting marks the session
 * abandoned).
 */
export function PauseOverlay({
  onResume,
  onQuit,
}: {
  onResume: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="animate-overlay-in flex min-h-[16rem] flex-col items-center justify-center gap-6">
      <div className="font-mono text-3xl text-text">Paused</div>
      <p className="text-sm text-text-dim">The question is hidden while paused.</p>
      <div className="flex gap-3">
        <Button variant="primary" size="md" autoFocus onClick={onResume}>
          Resume
        </Button>
        <Button variant="danger" size="md" onClick={onQuit}>
          Quit
        </Button>
      </div>
      <p className="text-xs text-text-dim">Esc to resume · quitting won't count</p>
    </div>
  );
}
