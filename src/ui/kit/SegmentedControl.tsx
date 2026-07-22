/**
 * SegmentedControl, the one accessible radiogroup (ui-redesign/02 §B). Codifies
 * the theme picker / drill config / font-size pickers that each hand-rolled the
 * same markup. Selected option = --surface-2 fill + accent text; the `.btn`
 * transition springs the press. role="radiogroup"/"radio" is preserved so e2e
 * (role+name queries) and a11y stay intact.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md',
  className = '',
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={['inline-flex rounded-btn border border-border bg-surface p-0.5', className]
        .filter(Boolean)
        .join(' ')}
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
              'btn rounded-[4px] font-medium active:scale-[0.97]',
              size === 'sm' ? 'px-2.5 py-1 text-sm' : 'px-3 py-1 text-sm',
              active
                ? 'bg-surface-2 text-accent shadow-[inset_0_1px_0_var(--hairline-top)]'
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
