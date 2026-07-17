import { localDateKey } from '@/lib/format';

const WEEKS = 26;

function midnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Consistency calendar (doc 05 §4 card 5): a 26-week grid of questions answered
 * per day. Sundays are the top row; the last column is the current week.
 */
export function Calendar({ perDay }: { perDay: Record<string, number> }) {
  const today = midnight(new Date());
  const dow = today.getDay(); // 0 = Sunday
  const start = addDays(today, -((WEEKS - 1) * 7 + dow));
  const max = Math.max(1, ...Object.values(perDay));

  const columns: { date: Date; count: number; future: boolean }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: { date: Date; count: number; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const future = date > today;
      col.push({ date, count: perDay[localDateKey(date.getTime())] ?? 0, future });
    }
    columns.push(col);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px]">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map(({ date, count, future }) => {
              const pct = count > 0 ? 25 + Math.round((count / max) * 75) : 0;
              return (
                <div
                  key={date.toISOString()}
                  title={
                    future
                      ? ''
                      : `${localDateKey(date.getTime())} · ${count} question${count === 1 ? '' : 's'}`
                  }
                  className="h-[10px] w-[10px] rounded-[2px]"
                  style={{
                    backgroundColor: future
                      ? 'transparent'
                      : count > 0
                        ? `color-mix(in srgb, var(--good) ${pct}%, var(--surface-2))`
                        : 'var(--surface-2)',
                    opacity: future ? 0 : 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
