import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { EmotionScores, EMOTION_COLORS } from '../../types';
import { useAppStore } from '../../store/appStore';

interface Props { scores: EmotionScores; }

export default function EmotionRadar({ scores }: Props) {
  const { currentEmotion } = useAppStore();
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  const data = Object.entries(scores).map(([emotion, value]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: Math.round(value * 100),
    color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="emotion"
          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: '#475569', fontSize: 9 }}
          tickCount={4}
        />
        <Radar
          name="Emotion"
          dataKey="value"
          stroke={accentColor}
          fill={accentColor}
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(13,27,42,0.95)',
            border: `1px solid ${accentColor}40`,
            borderRadius: 12,
            color: '#e2e8f0',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
