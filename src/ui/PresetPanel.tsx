import { useState } from 'react';
import {
  usePresetStore,
  allPresets,
  findPreset,
} from '@/store/usePresetStore';
import {
  DURATIONS_MS,
  presetHasAnyOp,
  type OpToggles,
  type SprintPreset,
} from '@/store/presets';
import { durationLabel } from '@/lib/format';
import { Button } from '@/ui/Button';
import { SegmentedControl } from '@/ui/kit';

interface Draft {
  name: string;
  durationMs: number;
  ops: OpToggles;
  addRange: { min: number; max: number };
  mulRange: { aMin: number; aMax: number; bMin: number; bMax: number };
}

function draftFrom(p: SprintPreset, rename = false): Draft {
  return {
    name: rename ? `${p.name} copy` : p.name,
    durationMs: p.durationMs,
    ops: { ...p.ops },
    addRange: { ...p.addRange },
    mulRange: { ...p.mulRange },
  };
}

function draftValid(d: Draft): boolean {
  const anyOp = d.ops.add || d.ops.sub || d.ops.mul || d.ops.div;
  const okAdd = d.addRange.min >= 2 && d.addRange.max >= d.addRange.min;
  const okMul =
    d.mulRange.aMin >= 2 &&
    d.mulRange.aMax >= d.mulRange.aMin &&
    d.mulRange.bMin >= 2 &&
    d.mulRange.bMax >= d.mulRange.bMin;
  return anyOp && okAdd && okMul && d.name.trim().length > 0;
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-dim">
      {label}
      <input
        type="number"
        value={value}
        min={2}
        onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
        className="w-20 rounded-btn border border-border bg-surface px-2 py-1 font-mono text-sm text-text outline-none focus:border-accent"
      />
    </label>
  );
}

const OPS: { key: keyof OpToggles; label: string }[] = [
  { key: 'add', label: '+' },
  { key: 'sub', label: '−' },
  { key: 'mul', label: '×' },
  { key: 'div', label: '÷' },
];

/** Preset selector + custom CRUD (doc 03 §2). Zetamac Default is immutable. */
export function PresetPanel() {
  const { custom, selectedId, select, create, update, remove } = usePresetStore();
  const presets = allPresets(custom);
  const selected = findPreset(custom, selectedId);

  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(selected));

  const beginNew = (from: SprintPreset) => {
    setDraft(draftFrom(from, true));
    setEditing('new');
  };
  const beginEdit = (p: SprintPreset) => {
    setDraft(draftFrom(p));
    setEditing(p.id);
  };
  const save = () => {
    if (!draftValid(draft)) return;
    const payload = { ...draft, extended: false };
    if (editing === 'new') create(payload);
    else if (editing) update(editing, payload);
    setEditing(null);
  };

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => select(e.target.value)}
          className="rounded-btn border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
          aria-label="Sprint preset"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {durationLabel(p.durationMs)}
            </option>
          ))}
        </select>

        <Button variant="secondary" size="sm" onClick={() => beginNew(selected)}>
          {selected.builtin ? 'Duplicate' : 'New'}
        </Button>
        {!selected.builtin && (
          <>
            <Button variant="secondary" size="sm" onClick={() => beginEdit(selected)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => remove(selected.id)}>
              Delete
            </Button>
          </>
        )}
      </div>

      {editing !== null && (
        <div className="panel p-4 text-left">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs text-text-dim">
              Name
              <input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="rounded-btn border border-border bg-bg px-2 py-1 text-sm text-text outline-none focus:border-accent"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-dim">Duration</span>
              <SegmentedControl
                size="sm"
                ariaLabel="Duration"
                value={String(draft.durationMs)}
                options={DURATIONS_MS.map((ms) => ({
                  value: String(ms),
                  label: durationLabel(ms),
                }))}
                onChange={(v) => patch({ durationMs: Number(v) })}
                className="self-start"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-dim">Operations</span>
              <div className="flex gap-1">
                {OPS.map((op) => (
                  <button
                    key={op.key}
                    type="button"
                    aria-pressed={draft.ops[op.key]}
                    onClick={() =>
                      patch({ ops: { ...draft.ops, [op.key]: !draft.ops[op.key] } })
                    }
                    className={`h-9 w-9 rounded-btn font-mono text-lg ${
                      draft.ops[op.key]
                        ? 'bg-accent text-bg'
                        : 'border border-border text-text-dim hover:text-text'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <NumberField
                label="Add/Sub min"
                value={draft.addRange.min}
                onChange={(n) => patch({ addRange: { ...draft.addRange, min: n } })}
              />
              <NumberField
                label="Add/Sub max"
                value={draft.addRange.max}
                onChange={(n) => patch({ addRange: { ...draft.addRange, max: n } })}
              />
              <NumberField
                label="Mul a-min"
                value={draft.mulRange.aMin}
                onChange={(n) => patch({ mulRange: { ...draft.mulRange, aMin: n } })}
              />
              <NumberField
                label="Mul a-max"
                value={draft.mulRange.aMax}
                onChange={(n) => patch({ mulRange: { ...draft.mulRange, aMax: n } })}
              />
              <NumberField
                label="Mul b-min"
                value={draft.mulRange.bMin}
                onChange={(n) => patch({ mulRange: { ...draft.mulRange, bMin: n } })}
              />
              <NumberField
                label="Mul b-max"
                value={draft.mulRange.bMax}
                onChange={(n) => patch({ mulRange: { ...draft.mulRange, bMax: n } })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={save}
                disabled={!draftValid(draft)}
              >
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              {!draftValid(draft) && (
                <span className="text-xs text-text-dim">
                  Enable an op; ranges need min ≥ 2 and max ≥ min.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!presetHasAnyOp(selected) && (
        <p className="text-center text-xs text-bad">
          This preset has no operations enabled. Edit it before playing.
        </p>
      )}
    </div>
  );
}
