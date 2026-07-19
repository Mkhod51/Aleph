import { useRef, useState } from 'react';
import { Card, Eyebrow } from '@/ui/primitives';
import { Button } from '@/ui/Button';
import {
  exportJson,
  exportAttemptsCsv,
  previewImport,
  importBundle,
  eraseAll,
  type ImportPreview,
} from '@/store/exportImport';

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

export function DataSettings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [eraseText, setEraseText] = useState('');
  const [busy, setBusy] = useState(false);

  const onExportJson = async () => {
    download(`aleph-export-${today()}.json`, await exportJson(), 'application/json');
    setMessage('Exported data as JSON.');
  };
  const onExportCsv = async () => {
    download(`aleph-attempts-${today()}.csv`, await exportAttemptsCsv(), 'text/csv');
    setMessage('Exported attempts as CSV.');
  };

  const onFile = async (file: File) => {
    setMessage(null);
    setPreview(await previewImport(await file.text()));
  };

  const confirmImport = async (mode: 'merge' | 'replace') => {
    if (!preview?.bundle) return;
    setBusy(true);
    try {
      await importBundle(preview.bundle, mode);
      setMessage(
        mode === 'merge'
          ? `Merged: +${preview.newCounts.sessions} sessions, +${preview.newCounts.attempts} attempts.`
          : `Replaced with ${preview.totals.sessions} sessions, ${preview.totals.attempts} attempts.`,
      );
    } finally {
      setBusy(false);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onErase = async () => {
    setBusy(true);
    try {
      await eraseAll();
      setMessage('All history and custom presets erased.');
    } finally {
      setBusy(false);
      setEraseText('');
    }
  };

  return (
    <Card>
      <Eyebrow>Data</Eyebrow>
      <p className="mt-1 text-[0.8125rem] text-text-dim">
        Everything is stored locally. Export before switching browsers or devices.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onExportJson}>
          Export JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={onExportCsv}>
          Export attempts CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          Import JSON…
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </div>

      {preview && (
        <div className="mt-3 rounded-card border border-border bg-bg p-3 text-sm">
          {preview.ok ? (
            <>
              <p className="text-text">
                File contains {preview.totals.sessions} sessions,{' '}
                {preview.totals.attempts} attempts, {preview.totals.personalBests}{' '}
                personal bests.
              </p>
              <p className="mt-1 text-text-dim">
                Merge adds {preview.newCounts.sessions} new sessions and{' '}
                {preview.newCounts.attempts} new attempts. Replace wipes current
                data first.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void confirmImport('merge')}
                >
                  Merge
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={busy}
                  onClick={() => void confirmImport('replace')}
                >
                  Replace
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <p className="text-bad">{preview.error}</p>
          )}
        </div>
      )}

      {/* Erase all */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-sm text-text">Erase all data</p>
        <p className="mt-1 text-[0.8125rem] text-text-dim">
          Deletes all sessions, attempts and custom presets. Type{' '}
          <span className="font-mono text-text">DELETE</span> to confirm.
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={eraseText}
            onChange={(e) => setEraseText(e.target.value)}
            placeholder="DELETE"
            className="w-32 rounded-btn border border-border bg-bg px-2 py-1 font-mono text-sm text-text outline-none focus:border-bad"
          />
          <Button
            variant="danger"
            size="sm"
            disabled={eraseText !== 'DELETE' || busy}
            onClick={() => void onErase()}
          >
            Erase everything
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-good">{message}</p>}
    </Card>
  );
}
