/**
 * Toggle — the one on/off switch (ui-redesign/02 §B). Codifies the switch that
 * was inline in Settings. Track uses --accent when on; the knob springs across
 * via --ease-spring. role="switch" + aria-checked preserved for a11y/e2e.
 */
export function Toggle({
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
        'btn relative h-6 w-11 rounded-full border',
        checked ? 'border-accent bg-accent' : 'border-border bg-surface-2',
      ].join(' ')}
    >
      <span
        className={[
          'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-bg transition-transform duration-fast ease-spring-t',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}
