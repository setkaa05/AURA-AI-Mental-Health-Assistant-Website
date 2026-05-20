import { create } from 'zustand';
import { Emotion, EmotionResult, AmbientTheme, EMOTION_BG } from '../types';

interface AppState {
  currentEmotion: Emotion;
  emotionResult: EmotionResult | null;
  ambientTheme: AmbientTheme;
  language: string;
  sessionId: string;
  backendOnline: boolean;
  visualIntensity: 'low' | 'medium' | 'high';

  setEmotion: (result: EmotionResult) => void;
  setLanguage: (lang: string) => void;
  setSessionId: (id: string) => void;
  setBackendOnline: (v: boolean) => void;
  setVisualIntensity: (v: 'low' | 'medium' | 'high') => void;
}

const DEFAULT_THEME: AmbientTheme = { bg: '#0a0a0f', accent: '#7c3aed', particle: 'drift' };

export const useAppStore = create<AppState>((set) => ({
  currentEmotion: 'neutral',
  emotionResult: null,
  ambientTheme: DEFAULT_THEME,
  language: 'auto',
  sessionId: crypto.randomUUID(),
  backendOnline: false,
  visualIntensity: 'high',

  setEmotion: (result) =>
    set({
      currentEmotion: result.primary_emotion,
      emotionResult: result,
      ambientTheme: result.ambient_theme ?? DEFAULT_THEME,
    }),

  setLanguage: (language) => set({ language }),
  setSessionId: (sessionId) => set({ sessionId }),
  setBackendOnline: (backendOnline) => set({ backendOnline }),
  setVisualIntensity: (visualIntensity) => set({ visualIntensity }),
}));
