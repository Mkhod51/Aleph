import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ulid } from '@/lib/ulid';
import {
  ZETAMAC_DEFAULT,
  ZETAMAC_DEFAULT_ID,
  type SprintPreset,
} from './presets';

/**
 * Preset store — the immutable Zetamac Default plus user-created custom presets,
 * persisted to localStorage. The built-in is never stored (it's a constant) so it
 * can never be edited or deleted (doc 03 §2).
 */
interface PresetStore {
  custom: SprintPreset[];
  selectedId: string;
  /** Built-in default first, then custom presets. */
  create: (draft: Omit<SprintPreset, 'id' | 'builtin'>) => string;
  update: (id: string, patch: Partial<Omit<SprintPreset, 'id' | 'builtin'>>) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
}

export const usePresetStore = create<PresetStore>()(
  persist(
    (set) => ({
      custom: [],
      selectedId: ZETAMAC_DEFAULT_ID,

      create: (draft) => {
        const id = ulid();
        set((s) => ({
          custom: [...s.custom, { ...draft, id, builtin: false }],
          selectedId: id,
        }));
        return id;
      },

      update: (id, patch) =>
        set((s) => ({
          custom: s.custom.map((p) =>
            p.id === id && !p.builtin ? { ...p, ...patch } : p,
          ),
        })),

      remove: (id) =>
        set((s) => ({
          custom: s.custom.filter((p) => p.id !== id),
          selectedId: s.selectedId === id ? ZETAMAC_DEFAULT_ID : s.selectedId,
        })),

      select: (id) => set({ selectedId: id }),
    }),
    { name: 'aleph-presets', version: 1 },
  ),
);

/** All presets in display order (built-in first). */
export function allPresets(custom: SprintPreset[]): SprintPreset[] {
  return [ZETAMAC_DEFAULT, ...custom];
}

/** Resolve a preset id to its preset, falling back to the built-in default. */
export function findPreset(custom: SprintPreset[], id: string): SprintPreset {
  return allPresets(custom).find((p) => p.id === id) ?? ZETAMAC_DEFAULT;
}
