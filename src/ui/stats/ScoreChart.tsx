import {
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Band } from '@/content/bands';
import type { ScorePoint } from '@/store/dashboard';

/**
 * Score-over-time line with band-shaded background and PB markers (doc 05 §4
 * card 2). Lazy-loaded so Recharts stays out of the play/home bundle (doc 08 §1).
 */
export default function ScoreChart({
  data,
  bands,
  onPointClick,
}: {
  data: ScorePoint[];
  bands: Band[];
  onPointClick: (sessionId: string) => void;
}) {
  const maxScore = Math.max(...data.map((d) => d.score), 0);
  const yMax = Math.max(maxScore + 5, (bands[bands.length - 1]?.min ?? 0) + 5);
  const points = data.map((d, i) => ({ ...d, i }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        {bands.map((b, idx) => (
          <ReferenceArea
            key={b.label}
            y1={b.min}
            y2={idx + 1 < bands.length ? (bands[idx + 1] as Band).min : yMax}
            fill={b.color}
            fillOpacity={0.12}
            stroke="none"
          />
        ))}
        <XAxis
          dataKey="i"
          tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
          tickFormatter={(i: number) => points[i]?.date.slice(5) ?? ''}
          stroke="var(--border)"
        />
        <YAxis
          domain={[0, yMax]}
          tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
          stroke="var(--border)"
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: 12,
          }}
          labelFormatter={(i) => points[i as number]?.date ?? ''}
          formatter={(v: number) => [v, 'score']}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--accent)"
          strokeWidth={2}
          isAnimationActive={false}
          dot={(props) => {
            const p = points[props.index as number];
            const pb = p?.isPB;
            return (
              <circle
                key={props.index}
                cx={props.cx}
                cy={props.cy}
                r={pb ? 4 : 2.5}
                fill={pb ? 'var(--accent)' : 'var(--bg)'}
                stroke="var(--accent)"
                strokeWidth={1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => p && onPointClick(p.sessionId)}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
