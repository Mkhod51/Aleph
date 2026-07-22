import { Button } from '@/ui/Button';
import { Modal } from '@/ui/kit';

/**
 * Pause overlay (doc 03 §1.2), now the kit Modal (O1: fade+scale in, instant
 * close via unmount). The clock is frozen and the question is already unmounted
 * by the play page while paused, so nothing shows through the scrim. Esc /
 * backdrop resume; quitting marks the session abandoned.
 */
export function PauseOverlay({
  onResume,
  onQuit,
}: {
  onResume: () => void;
  onQuit: () => void;
}) {
  return (
    <Modal open onClose={onResume} labelledBy="pause-title" className="text-center">
      <div className="flex flex-col items-center gap-5">
        <div id="pause-title" className="font-mono text-3xl text-text">
          Paused
        </div>
        <p className="text-sm text-text-dim">
          The question is hidden while paused.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" size="md" onClick={onResume}>
            Resume
          </Button>
          <Button variant="danger" size="md" onClick={onQuit}>
            Quit
          </Button>
        </div>
        <p className="text-xs text-text-dim">Esc to resume · quitting won&apos;t count</p>
      </div>
    </Modal>
  );
}
