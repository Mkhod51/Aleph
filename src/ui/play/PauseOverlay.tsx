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
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-6">
      <div className="font-mono text-3xl text-text">Paused</div>
      <p className="text-sm text-text-dim">The question is hidden while paused.</p>
      <div className="flex gap-3">
        <button
          type="button"
          autoFocus
          onClick={onResume}
          className="rounded-btn bg-accent px-5 py-2 font-medium text-bg hover:brightness-110"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onQuit}
          className="rounded-btn border border-border px-5 py-2 text-text-dim hover:border-bad hover:text-text"
        >
          Quit
        </button>
      </div>
      <p className="text-xs text-text-dim">Esc to resume · quitting won't count</p>
    </div>
  );
}
