import type { RefObject } from 'react';
import type { Question } from '@/engine';
import type { Settings } from '@/store/useSettingsStore';

const PROMPT_SIZE: Record<Settings['questionFontSize'], string> = {
  S: 'text-4xl',
  M: 'text-5xl',
  L: 'text-6xl',
  XL: 'text-7xl',
};

/**
 * The prompt + answer input, the entire interface during play (doc 07 §1/§4).
 * The prompt area has a fixed min-height so question changes cause zero layout
 * shift. `aria-live` announces each new prompt to screen readers (doc 07 §7).
 */
export function PlayField({
  question,
  input,
  onInputChange,
  onSubmit,
  fontSize,
  inputRef,
}: {
  question: Question;
  input: string;
  onInputChange: (raw: string) => void;
  /** Test-input mode: commit on Enter (flow mode leaves this undefined). */
  onSubmit?: () => void;
  fontSize: Settings['questionFontSize'];
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div
        aria-live="polite"
        className={`flex min-h-[6rem] items-center justify-center text-center font-mono tabular-nums text-text ${PROMPT_SIZE[fontSize]}`}
      >
        {question.prompt}
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        onPaste={(e) => e.preventDefault()}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode={question.format === 'integer' ? 'numeric' : 'decimal'}
        aria-label="Your answer"
        className="w-56 rounded-card border border-border bg-surface px-4 py-3 text-center font-mono text-4xl tabular-nums text-text caret-accent outline-none focus:border-accent"
      />
    </div>
  );
}
