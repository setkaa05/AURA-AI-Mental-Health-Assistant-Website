// AURA — Shared TypeScript Types

export type Emotion = 'anger' | 'disgust' | 'fear' | 'joy' | 'neutral' | 'sadness' | 'surprise';

export interface EmotionScores {
  anger: number;
  disgust: number;
  fear: number;
  joy: number;
  neutral: number;
  sadness: number;
  surprise: number;
}

export interface AmbientTheme {
  bg: string;
  accent: string;
  particle: string;
}

export interface EmotionResult {
  primary_emotion: Emotion;
  confidence: number;
  scores: EmotionScores;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  valence: number;
  arousal: number;
  ambient_theme: AmbientTheme;
  emotion_meta: { color: string; glow: string; intensity: string; valence: number };
  inference_time_ms: number;
  model: string;
  device: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  timestamp: string;
  emotion?: EmotionResult;
}

export interface ChatResponse {
  session_id: string;
  user_message: string;
  ai_response: string;
  language: string;
  language_info: { name: string; native: string; flag: string };
  lang_detection_confidence: number;
  emotion: EmotionResult;
  timestamp: string;
}

export interface ModelBenchmark {
  name: string;
  full_name: string;
  params: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  inference_time_ms: number;
  model_size_mb: number;
  task: string;
  dataset: string;
  architecture: string;
  description: string;
  color: string;
}

export interface LossCurve {
  epochs: number[];
  train_loss: number[];
  val_loss: number[];
}

export interface WellnessRecommendation {
  type: 'breathing' | 'journaling' | 'meditation' | 'activity';
  title: string;
  description: string;
  duration_minutes: number;
  icon: string;
  steps?: string[];
  prompt?: string;
}

export interface WeeklyAnalytics {
  period: string;
  total_interactions: number;
  daily_summary: DailySummary[];
  emotion_totals: Record<Emotion, number>;
  most_frequent_emotion: Emotion;
}

export interface DailySummary {
  date: string;
  total_entries: number;
  dominant_emotion: Emotion;
  emotion_counts: Record<string, number>;
  avg_confidence: number;
}

export interface EmotionLog {
  id: number;
  session_id: string;
  text: string;
  language: string;
  primary_emotion: Emotion;
  confidence: number;
  scores: EmotionScores;
  sentiment: string;
  sentiment_score: number;
  timestamp: string;
}

export const EMOTION_COLORS: Record<Emotion, string> = {
  anger:    '#ef4444',
  disgust:  '#a855f7',
  fear:     '#f97316',
  joy:      '#22c55e',
  neutral:  '#64748b',
  sadness:  '#3b82f6',
  surprise: '#eab308',
};

export const EMOTION_GLOW: Record<Emotion, string> = {
  anger:    'rgba(239,68,68,0.4)',
  disgust:  'rgba(168,85,247,0.4)',
  fear:     'rgba(249,115,22,0.4)',
  joy:      'rgba(34,197,94,0.4)',
  neutral:  'rgba(100,116,139,0.3)',
  sadness:  'rgba(59,130,246,0.4)',
  surprise: 'rgba(234,179,8,0.4)',
};

export const EMOTION_BG: Record<Emotion, string> = {
  anger:    '#1a0505',
  disgust:  '#0f0a1a',
  fear:     '#0f0f0a',
  joy:      '#051a0a',
  neutral:  '#0a0a0f',
  sadness:  '#05080f',
  surprise: '#0f0f05',
};

export const EMOTION_EMOJIS: Record<Emotion, string> = {
  anger:    '😠',
  disgust:  '😒',
  fear:     '😨',
  joy:      '😊',
  neutral:  '😐',
  sadness:  '😢',
  surprise: '😲',
};
