import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/Button';

/**
 * EmptyState — one treatment for every "no data yet" card (ui-redesign/02 §B):
 * a `.gridfield` panel + eyebrow + one line + one CTA. Unifies the shell; pages
 * keep their own copy. The CTA navigates (`to`) or runs `onClick`.
 */
export function EmptyState({
  eyebrow,
  title,
  children,
  action,
  className = '',
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: { label: string; to?: string; onClick?: () => void };
  className?: string;
}) {
  const navigate = useNavigate();
  const onAction =
    action?.onClick ?? (action?.to ? () => navigate(action.to as string) : undefined);

  return (
    <div
      className={[
        'panel gridfield flex flex-col items-center gap-3 p-8 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {eyebrow && (
        <div className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-text-faint">
          {eyebrow}
        </div>
      )}
      {title && (
        <div className="font-mono text-lg font-semibold text-text">{title}</div>
      )}
      {children && <p className="max-w-sm text-sm text-text-dim">{children}</p>}
      {action && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
