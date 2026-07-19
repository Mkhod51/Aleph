import type { ReactNode } from 'react';
import { Card, Eyebrow } from '@/ui/primitives';
import {
  useSettingsStore,
  type Settings,
} from '@/store/useSettingsStore';
import type { ThemeSetting } from '@/store/theme';
import { DataSettings } from '@/ui/DataSettings';
import { APP_NAME } from '@/lib/brand';

const THEMES: { value: ThemeSetting; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex rounded-btn border border-border p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-[4px] px-3 py-1 text-sm transition-colors',
              active
                ? 'bg-accent font-medium text-bg'
                : 'text-text-dim hover:text-text',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-text">{label}</span>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-6 w-11 rounded-full border transition-colors',
        checked ? 'border-accent bg-accent' : 'border-border bg-surface-2',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-transform',
          checked ? 'left-0.5 translate-x-5' : 'left-0.5 translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

const FONT_SIZES: { value: Settings['questionFontSize']; label: string }[] = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
];

export function SettingsPage() {
  const s = useSettingsStore();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="font-mono text-2xl font-semibold text-text">Settings</h1>

      <Card>
        <Eyebrow>Appearance</Eyebrow>
        <div className="mt-3">
          <Row label="Theme">
            <Segmented
              ariaLabel="Theme"
              value={s.theme}
              options={THEMES}
              onChange={s.setTheme}
            />
          </Row>
        </div>
      </Card>

      <Card>
        <Eyebrow>Gameplay</Eyebrow>
        <p className="mt-1 text-[0.8125rem] text-text-dim">
          Saved now; they take effect on the play screen in the next milestone.
        </p>
        <div className="mt-2 divide-y divide-border">
          <Row label="Countdown before play">
            <Toggle
              label="Countdown before play"
              checked={s.countdown}
              onChange={(v) => s.update({ countdown: v })}
            />
          </Row>
          <Row label="Show clock during play">
            <Toggle
              label="Show clock during play"
              checked={s.clockVisible}
              onChange={(v) => s.update({ clockVisible: v })}
            />
          </Row>
          <Row label="Show score during play">
            <Toggle
              label="Show score during play"
              checked={s.scoreVisible}
              onChange={(v) => s.update({ scoreVisible: v })}
            />
          </Row>
          {/* Sound toggle hidden until audio is wired (M6, P2) — a control that
              does nothing erodes trust. The `sound` setting is kept for then. */}
          <Row label="Question font size">
            <Segmented
              ariaLabel="Question font size"
              value={s.questionFontSize}
              options={FONT_SIZES}
              onChange={(v) => s.update({ questionFontSize: v })}
            />
          </Row>
        </div>
      </Card>

      <DataSettings />

      <Card>
        <Eyebrow>About</Eyebrow>
        <div className="mt-2 space-y-2 text-sm text-text-dim">
          <p>
            Score bands and pass bars in {APP_NAME} are{' '}
            <span className="text-text">community-reported estimates</span>, not
            official firm data.
          </p>
          <p>
            All your data stays in this browser — no accounts, no servers, no
            analytics. Export/import arrives with Sprint mode.
          </p>
          <p>
            Inspired by arithmetic.zetamac.com. {APP_NAME} v0.0.0 · milestone M0.
          </p>
        </div>
      </Card>
    </div>
  );
}
