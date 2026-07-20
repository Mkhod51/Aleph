import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Eyebrow } from '@/ui/primitives';
import { Button } from '@/ui/Button';
import { useStreakStore } from '@/store/streak';
import { todayKey } from '@/store/daily';
import { dailyRepo } from '@/store/repos/dailyRepo';
import type { DailyRecord } from '@/store/types';

function History({ records }: { records: DailyRecord[] }) {
  const recent = records.slice(-14);
  const max = Math.max(...recent.map((r) => r.score), 1);
  return (
    <div className="flex h-16 items-end gap-1.5">
      {recent.map((r) => (
        <div
          key={r.date}
          className="w-4 rounded-sm bg-accent/80"
          style={{ height: `${Math.max(6, (r.score / max) * 100)}%` }}
          title={`${r.date}: ${r.score}`}
        />
      ))}
    </div>
  );
}

export function DailyPage() {
  const navigate = useNavigate();
  const streak = useStreakStore();
  const [records, setRecords] = useState<DailyRecord[] | null>(null);
  const today = todayKey();

  useEffect(() => {
    let alive = true;
    dailyRepo.all().then((r) => alive && setRecords(r));
    return () => {
      alive = false;
    };
  }, []);

  const playedToday = records?.some((r) => r.date === today) ?? false;
  const todayScore = records?.find((r) => r.date === today)?.score;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-mono text-2xl font-semibold text-text">Daily challenge</h1>
        <p className="mt-1 text-sm text-text-dim">
          A 120-second sprint on the same question sequence for everyone, every day.
          The cleanest day-over-day signal.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>Streak</Eyebrow>
            <div className="mt-1 font-mono text-2xl tabular-nums text-text">
              🔥 {streak.current}
              <span className="ml-3 text-sm text-text-dim">
                best {streak.best} · {streak.freezes} freeze{streak.freezes === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            mono
            autoFocus
            onClick={() => navigate('/daily/play')}
          >
            {playedToday ? '▶ Replay (unofficial)' : '▶ Play today’s 120s'}
          </Button>
        </div>
        {playedToday && (
          <p className="mt-3 text-sm text-text-dim">
            Today’s official score: <span className="text-text">{todayScore}</span>.
            Replays don’t count toward your streak or history.
          </p>
        )}
      </Card>

      <Card>
        <Eyebrow>History · last 14 days</Eyebrow>
        {records && records.length > 0 ? (
          <div className="mt-3">
            <History records={records} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-dim">
            No dailies yet. Play today’s to start the streak.
          </p>
        )}
      </Card>
    </div>
  );
}
