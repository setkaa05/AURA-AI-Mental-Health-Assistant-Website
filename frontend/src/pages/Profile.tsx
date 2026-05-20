import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, MessageCircle, TrendingUp, Award, Calendar } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import EmotionBadge from '../components/ui/EmotionBadge';
import { analyticsAPI } from '../api/client';
import { useAppStore } from '../store/appStore';
import { EMOTION_COLORS, Emotion } from '../types';

export default function Profile() {
  const { currentEmotion, sessionId } = useAppStore();
  const [insights, setInsights] = useState<any>(null);
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  useEffect(() => {
    analyticsAPI.insights(sessionId).then(setInsights).catch(() => {});
  }, []);

  const emotionDist = insights?.emotion_distribution || {};
  const total = insights?.total_sessions || 0;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="section-badge mb-2">User Profile</div>

        {/* Profile card */}
        <GlassCard className="p-8 text-center space-y-4" glow={accentColor}>
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
              style={{ background: `radial-gradient(circle, ${accentColor}40, ${accentColor}10)`, border: `2px solid ${accentColor}50` }}>
              🧠
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">AURA User</h2>
            <p className="text-slate-400 text-sm">Emotional intelligence explorer</p>
          </div>
          <EmotionBadge emotion={currentEmotion} size="lg" />
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageCircle, label: 'Check-ins',     val: total },
            { icon: Award,         label: 'Positive Rate', val: `${insights?.positive_ratio ?? 0}%` },
            { icon: TrendingUp,    label: 'Neg Rate',      val: `${insights?.negative_ratio ?? 0}%` },
            { icon: Calendar,      label: 'Session',       val: sessionId.slice(0,6).toUpperCase() },
          ].map(({ icon: Icon, label, val }, i) => (
            <GlassCard key={label} delay={i * 0.06} className="p-5 text-center">
              <Icon size={18} className="mx-auto mb-2" style={{ color: accentColor }} />
              <div className="text-xl font-display font-bold text-white">{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Emotion distribution */}
        {Object.keys(emotionDist).length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 size={15} style={{ color: accentColor }} /> Emotional Fingerprint
            </h3>
            <div className="space-y-3">
              {Object.entries(emotionDist)
                .sort(([,a],[,b]) => (b as number) - (a as number))
                .map(([emotion, count]) => {
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                  const color = EMOTION_COLORS[emotion as Emotion];
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-slate-400 capitalize text-right">{emotion}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
                        />
                      </div>
                      <span className="w-12 text-xs font-mono text-slate-500">{Number(count)}× ({pct}%)</span>
                    </div>
                  );
                })}
            </div>
          </GlassCard>
        )}

        {/* Insights */}
        <GlassCard className="p-6" glow="#a855f7">
          <h3 className="font-display font-semibold text-white mb-4">AI Profile Insights</h3>
          <div className="space-y-3">
            {(insights?.insights || ['Start chatting with AURA to generate your emotional profile.']).map((i: string, idx: number) => (
              <div key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-violet-400 mt-0.5">✦</span>
                <span>{i}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
