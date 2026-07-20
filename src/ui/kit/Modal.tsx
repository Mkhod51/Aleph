import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Modal — themed centered panel on a dim scrim (ui-redesign/02 §B, motion O1).
 * surface-3 + the one allowed elevation shadow; fade+scale in via --dur-fast /
 * --ease-out (`animate-overlay-in`); **instant close** (unmounts, no exit anim);
 * Esc to dismiss; backdrop click dismisses; focus is trapped and restored.
 * Reduced-motion collapses the entrance to instant via the global CSS override.
 *
 * Reused for pause/quit confirms and the `?` shortcut overlay so those stop
 * hand-rolling scrim markup.
 */
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => !el.hasAttribute('disabled'),
      );
    // Focus the first focusable, else the panel itself.
    (focusables()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0] as HTMLElement;
        const last = items[items.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={[
          'animate-overlay-in w-full max-w-md rounded-card border border-border p-5 outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          backgroundColor: 'var(--surface-3)',
          boxShadow: 'inset 0 1px 0 var(--hairline-top), 0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
