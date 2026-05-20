import { create } from 'zustand';
import { EmotionLog, WeeklyAnalytics } from '../types';

interface AnalyticsState {
  emotionLogs: EmotionLog[];
  weeklyData: WeeklyAnalytics | null;
  insights: string[];
  radarData: Record<string, number>;
  isLoading: boolean;

  setEmotionLogs: (logs: EmotionLog[]) => void;
  setWeeklyData: (data: WeeklyAnalytics) => void;
  setInsights: (insights: string[]) => void;
  setRadarData: (data: Record<string, number>) => void;
  setLoading: (v: boolean) => void;
  addLog: (log: EmotionLog) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  emotionLogs: [],
  weeklyData: null,
  insights: [],
  radarData: {},
  isLoading: false,

  setEmotionLogs: (emotionLogs) => set({ emotionLogs }),
  setWeeklyData: (weeklyData) => set({ weeklyData }),
  setInsights: (insights) => set({ insights }),
  setRadarData: (radarData) => set({ radarData }),
  setLoading: (isLoading) => set({ isLoading }),
  addLog: (log) => set((s) => ({ emotionLogs: [log, ...s.emotionLogs].slice(0, 500) })),
}));
