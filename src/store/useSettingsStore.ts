import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, type ThemeSetting } from './theme';

/** User settings — doc 03 §11. Persisted to localStorage (doc 08 §1). */
export interface Settings {
  // Appearance
  theme: ThemeSetting;
  // Gameplay
  countdown: boolean; // show the 3-2-1 countdown
  countdownSkip: boolean; // skip it by default after the first play
  clockVisible: boolean;
  scoreVisible: boolean;
  sound: boolean; // key clicks / end buzzer (default off)
  questionFontSize: 'S' | 'M' | 'L' | 'XL';
  leftHandedKeypad: boolean; // mobile on-screen keypad mirror
  // Onboarding is shown exactly once (doc 03 §12).
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark', // dark is default (decision log item 4)
  countdown: true,
  countdownSkip: false,
  clockVisible: true,
  scoreVisible: true,
  sound: false,
  questionFontSize: 'L',
  leftHandedKeypad: false,
  onboarded: false,
};

interface SettingsStore extends Settings {
  setTheme: (theme: ThemeSetting) => void;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const SETTINGS_STORAGE_KEY = 'aleph-settings';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      update: (patch) => set(patch),
      reset: () => {
        set(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 1,
      // Persist only data fields (actions are not serializable anyway).
      partialize: (s): Settings => ({
        theme: s.theme,
        countdown: s.countdown,
        countdownSkip: s.countdownSkip,
        clockVisible: s.clockVisible,
        scoreVisible: s.scoreVisible,
        sound: s.sound,
        questionFontSize: s.questionFontSize,
        leftHandedKeypad: s.leftHandedKeypad,
        onboarded: s.onboarded,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
