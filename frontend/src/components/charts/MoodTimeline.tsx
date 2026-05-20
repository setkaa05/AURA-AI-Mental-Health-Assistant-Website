import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { DailySummary, EMOTION_COLORS } from '../../types';

interface Props { data: DailySummary[]; }

export default function MoodTimeline({ data }: Props) {
  const emotions = ['joy', 'sadness', 'anger', 'fear', 'neutral'];

  const chartData = data.map(d => ({
    date: d.date.slice(5),
    ...Object.fromEntries(
      emotions.map(e => [e, ((d.emotion_counts[e] || 0) / Math.max(d.total_entries, 1)) * 100])
    ),
    dominant: d.dominant_emotion,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <defs>
          {emotions.map(e => (
            <linearGradient key={e} id={`grad-${e}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={EMOTION_COLORS[e as keyof typeof EMOTION_COLORS]} stopOpacity={0.4} />
              <stop offset="95%" stopColor={EMOTION_COLORS[e as keyof typeof EMOTION_COLORS]} stopOpacity={0.0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(13,27,42,0.95)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 12,
            color: '#e2e8f0',
            fontSize: 11,
          }}
          formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
        />
        {emotions.map(e => (
          <Area
            key={e}
            type="monotone"
            dataKey={e}
            stroke={EMOTION_COLORS[e as keyof typeof EMOTION_COLORS]}
            fill={`url(#grad-${e})`}
            strokeWidth={1.5}
            stackId="1"
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
