import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { ModelBenchmark } from '../../types';

interface Props { models: Record<string, ModelBenchmark>; metric: 'accuracy' | 'f1' | 'precision' | 'recall'; }

export default function ModelComparison({ models, metric }: Props) {
  const data = Object.entries(models).map(([id, m]) => ({
    name: m.name,
    value: Math.round(m[metric] * 1000) / 10,
    color: m.color,
    params: m.params,
    speed: m.inference_time_ms,
  }));
  data.sort((a, b) => b.value - a.value);

  const metricLabel = { accuracy: 'Accuracy', f1: 'F1-Score', precision: 'Precision', recall: 'Recall' }[metric];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[75, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
        <Tooltip
          contentStyle={{
            background: 'rgba(13,27,42,0.95)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 12,
            color: '#e2e8f0',
            fontSize: 11,
          }}
          formatter={(v: number) => [`${v}%`, metricLabel]}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.color}
              style={{ filter: `drop-shadow(0 0 8px ${entry.color}66)` }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
