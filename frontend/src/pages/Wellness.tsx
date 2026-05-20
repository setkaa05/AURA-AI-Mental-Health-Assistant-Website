import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, BookOpen, Mountain, Music, Timer, RefreshCw, X } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import EmotionBadge from '../components/ui/EmotionBadge';
import { wellnessAPI } from '../api/client';
import { useAppStore } from '../store/appStore';
import { EMOTION_COLORS, Emotion } from '../types';

const TYPE_ICONS: Record<string, any> = {
  breathing: Wind, journaling: BookOpen, meditation: Mountain, activity: Music,
};

export default function Wellness() {
  const { currentEmotion, sessionId } = useAppStore();
  const [recs, setRecs] = useState<any[]>([]);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [breathPhase, setBreathPhase] = useState<'inhale'|'hold'|'exhale'>('inhale');
  const [breathTimer, setBreathTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  const fetch = async (emotion: string) => {
    setLoading(true);
    try {
      const data = await wellnessAPI.getRecommendations(emotion, sessionId, 4);
      setRecs(data.recommendations || []);
      setQuote(data.motivational_quote);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(currentEmotion); }, [currentEmotion]);

  const startBreathing = (rec: any) => {
    setActive(rec);
    let phase: 'inhale'|'hold'|'exhale' = 'inhale';
    const cycle = ['inhale','hold','exhale'] as const;
    const durations = [4000, 4000, 6000];
    let idx = 0;
    const tick = () => {
      setBreathPhase(cycle[idx % 3]);
      return setTimeout(() => { idx++; tick(); }, durations[idx % 3]);
    };
    setBreathTimer(tick() as any);
  };

  const stopBreathing = () => {
    if (breathTimer) clearTimeout(breathTimer as unknown as number);
    setActive(null);
    setBreathPhase('inhale');
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-badge mb-2">Wellness Engine</div>
            <h1 className="text-3xl font-display font-bold text-white">Wellness Recommendations</h1>
            <p className="text-slate-400 text-sm mt-1">Personalized for your emotional state</p>
          </div>
          <div className="flex items-center gap-3">
            <EmotionBadge emotion={currentEmotion} size="lg" />
            <button onClick={() => fetch(currentEmotion)} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition-all">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Emotion selector */}
        <GlassCard className="p-4 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 self-center mr-2">Filter by:</span>
          {(['joy','sadness','anger','fear','neutral','surprise','disgust'] as Emotion[]).map(e => (
            <button key={e} onClick={() => fetch(e)}
              className="px-3 py-1 rounded-full text-xs border transition-all capitalize"
              style={currentEmotion === e
                ? { borderColor: EMOTION_COLORS[e], color: EMOTION_COLORS[e], background: `${EMOTION_COLORS[e]}15` }
                : { borderColor: 'rgba(255,255,255,0.08)', color: '#64748b' }
              }
            >{e}</button>
          ))}
        </GlassCard>

        {/* Breathing exercise modal */}
        <AnimatePresence>
          {active && active.type === 'breathing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              <GlassCard className="p-10 flex flex-col items-center gap-8 max-w-sm w-full mx-4" glow={accentColor}>
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-display font-semibold text-white">{active.title}</h3>
                  <button onClick={stopBreathing} className="text-slate-500 hover:text-white"><X size={18} /></button>
                </div>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 0.9,
                      opacity: breathPhase === 'hold' ? 1 : 0.7,
                    }}
                    transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 0.1 : 6, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full border-2"
                    style={{ borderColor: accentColor, background: `radial-gradient(circle, ${accentColor}30, transparent)`, boxShadow: `0 0 40px ${accentColor}40` }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-display text-white capitalize">{breathPhase}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-400 text-center">{active.description}</div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading
            ? Array.from({length: 4}).map((_,i) => (
                <GlassCard key={i} className="p-6 h-44 animate-pulse" />
              ))
            : recs.map((rec, i) => {
                const Icon = TYPE_ICONS[rec.type] || Mountain;
                return (
                  <GlassCard key={i} delay={i * 0.08} hover glow={accentColor} className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{rec.icon}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                          {rec.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Timer size={11} /> {rec.duration_minutes}m
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-white">{rec.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{rec.description}</p>
                    {rec.prompt && (
                      <div className="text-xs text-slate-500 italic border-l-2 pl-3" style={{ borderColor: accentColor }}>
                        "{rec.prompt}"
                      </div>
                    )}
                    {rec.type === 'breathing' && (
                      <button
                        onClick={() => startBreathing(rec)}
                        className="text-xs px-4 py-1.5 rounded-lg font-medium text-white transition-all"
                        style={{ background: `${accentColor}40`, border: `1px solid ${accentColor}50` }}
                      >
                        Start Exercise
                      </button>
                    )}
                  </GlassCard>
                );
              })
          }
        </div>

        {/* Quote */}
        {quote && (
          <GlassCard className="p-6 text-center space-y-2" glow="#a855f7">
            <div className="text-3xl text-violet-400">✦</div>
            <blockquote className="text-slate-300 italic text-lg leading-relaxed">"{quote.quote}"</blockquote>
            <div className="text-sm text-slate-500">— {quote.author}</div>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
