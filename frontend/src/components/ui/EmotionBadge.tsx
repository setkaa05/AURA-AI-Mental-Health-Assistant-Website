import { Emotion, EMOTION_COLORS, EMOTION_EMOJIS } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  emotion: Emotion;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export default function EmotionBadge({ emotion, confidence, size = 'md', showScore = false }: Props) {
  const color = EMOTION_COLORS[emotion] || '#7c3aed';
  const emoji = EMOTION_EMOJIS[emotion] || '🤔';

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        boxShadow: `0 0 12px ${color}20`,
      }}
    >
      <span>{emoji}</span>
      <span className="capitalize">{emotion}</span>
      {showScore && confidence !== undefined && (
        <span className="opacity-60">{Math.round(confidence * 100)}%</span>
      )}
    </motion.span>
  );
}
