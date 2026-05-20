import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import EmotionBadge from '../components/ui/EmotionBadge';
import EmotionRadar from '../components/charts/EmotionRadar';
import MoodTimeline from '../components/charts/MoodTimeline';
import { analyticsAPI } from '../api/client';
import { useAppStore } from '../store/appStore';
import { useAnalyticsStore } from '../store/analyticsStore';
import { EMOTION_COLORS, Emotion } from '../types';

const MOCK_SCORES = { anger: 0.05, disgust: 0.03, fear: 0.08, joy: 0.35, neutral: 0.28, sadness: 0.14, surprise: 0.07 };

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const { currentEmotion } = useAppStore();
  const { weeklyData, insights, radarData, setWeeklyData, setInsights, setRadarData } = useAnalyticsStore();
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [weekly, insightsData, radar] = await Promise.all([
        analyticsAPI.weekly(),
        analyticsAPI.insights(),
        analyticsAPI.radar(),
      ]);
      setWeeklyData(weekly);
      setInsights(insightsData.insights || []);
      setRadarData(radar.radar_data || {});
    } catch { /* use mock data */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const displayScores = Object.keys(radarData).length > 0
    ? radarData as any
    : MOCK_SCORES;

  const trajectory = weeklyData?.most_frequent_emotion;
  const TrajectoryIcon = trajectory === 'joy' ? TrendingUp : trajectory === 'sadness' || trajectory === 'anger' ? TrendingDown : Minus;

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="section-badge mb-2">Emotion Analytics</div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Your emotional intelligence insights powered by transformer NLP</p>
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-slate-400 hover:text-white transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Interactions', val: weeklyData?.total_interactions ?? '—', color: '#7c3aed' },
            { label: 'Dominant Emotion',   val: weeklyData?.most_frequent_emotion ?? currentEmotion, isEmotion: true },
            { label: 'Days Tracked',        val: weeklyData?.daily_summary?.length ?? '0', color: '#22c55e' },
            { label: 'Active Sessions',     val: weeklyData?.daily_summary?.filter(d => d.total_entries > 0).length ?? '0', color: '#06b6d4' },
          ].map(({ label, val, color, isEmotion }, i) => (
            <GlassCard key={label} delay={i * 0.07} className="p-5" glow={color}>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">{label}</div>
              {isEmotion
                ? <EmotionBadge emotion={(val as Emotion) || 'neutral'} size="lg" />
                : <div className="text-3xl font-display font-bold" style={{ color: color || '#fff' }}>{val}</div>
              }
            </GlassCard>
          ))}
        </div>

        {/* Radar + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard className="p-6" glow={accentColor}>
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              Emotion Radar
            </h3>
            <EmotionRadar scores={displayScores} />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-cyan-400" /> 7-Day Mood Timeline
            </h3>
            {weeklyData?.daily_summary && weeklyData.daily_summary.length > 0
              ? <MoodTimeline data={weeklyData.daily_summary} />
              : <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">Start chatting to generate timeline data</div>
            }
          </GlassCard>
        </div>

        {/* Emotion breakdown bars */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-5">Emotion Score Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(displayScores)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([emotion, score]) => {
                const pct = Math.round((score as number) * 100);
                const color = EMOTION_COLORS[emotion as Emotion];
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-slate-400 capitalize text-right">{emotion}</div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: color, boxShadow: `0 0 8px ${color}88` }}
                      />
                    </div>
                    <div className="w-10 text-xs font-mono text-slate-400">{pct}%</div>
                  </div>
                );
              })}
          </div>
        </GlassCard>

        {/* AI Insights */}
        <GlassCard className="p-6" glow="#a855f7">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={15} className="text-violet-400" /> AI Insights
          </h3>
          <div className="space-y-3">
            {(insights.length > 0 ? insights : ['Start chatting to generate personalized insights.']).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 text-sm text-slate-300"
              >
                <span className="text-violet-400 mt-0.5 flex-shrink-0">✦</span>
                <span>{insight}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
