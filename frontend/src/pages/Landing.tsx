import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Globe, BarChart3, Mic, Heart, ArrowRight, ChevronDown } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import AuraOrb from '../components/three/AuraOrb';
import NeuralBackground from '../components/three/NeuralBackground';
import GlassCard from '../components/ui/GlassCard';

const features = [
  { icon: Brain,   title: 'Transformer NLP',  desc: 'DistilRoBERTa emotion detection across 7 emotional dimensions with real-time confidence scores.', color: '#7c3aed' },
  { icon: Globe,   title: 'Multilingual AI',   desc: 'Supports English, Hindi, Tamil, Telugu, Malayalam with auto language detection.', color: '#06b6d4' },
  { icon: Zap,     title: 'Adaptive UI',       desc: 'The entire interface reacts to your emotional state — colors, particles, ambient glow all shift.', color: '#a855f7' },
  { icon: BarChart3, title: 'Emotion Analytics', desc: 'Radar charts, mood timelines, weekly trends, and AI-generated insights from your emotional patterns.', color: '#22c55e' },
  { icon: Mic,     title: 'Voice Input',       desc: 'Whisper-powered speech-to-text with real-time waveform visualization.', color: '#f97316' },
  { icon: Heart,   title: 'Wellness Engine',   desc: 'Personalized breathing exercises, journaling prompts, and meditation recommendations.', color: '#f43f5e' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <PageTransition>
      <NeuralBackground emotion="neutral" />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center neural-grid overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col items-center gap-8 max-w-4xl">

          {/* Section badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="section-badge"
          >
            <Zap size={10} /> Next-Generation AI Mental Health Platform
          </motion.div>

          {/* Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 80 }}
          >
            <AuraOrb emotion="neutral" canvasSize={240} size={1.4} />
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight">
              <span className="text-white">Meet </span>
              <span className="gradient-text text-glow-aurora">AURA</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed">
              An emotionally intelligent AI companion powered by{' '}
              <span className="text-violet-400 font-medium">transformer-based NLP</span>,{' '}
              multilingual understanding, and cinematic visualization.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-white relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              <span className="relative z-10">Start Conversation</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/research')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold glass border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 transition-all"
            >
              <Brain size={16} />
              Research Lab
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-8 justify-center text-center mt-4"
          >
            {[
              { val: '7',    label: 'Emotion Classes' },
              { val: '5',    label: 'Languages' },
              { val: '5',    label: 'NLP Models' },
              { val: '100%', label: 'Local & Private' },
            ].map(({ val, label }) => (
              <div key={label} className="space-y-1">
                <div className="text-3xl font-display font-bold gradient-text">{val}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 text-slate-600 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="section-badge mx-auto w-fit">Platform Capabilities</div>
          <h2 className="text-4xl font-display font-bold text-white">
            Built for emotional <span className="gradient-text">intelligence</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Every feature is powered by state-of-the-art NLP models running entirely on your local machine.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <GlassCard key={title} delay={i * 0.08} glow={color} hover className="p-6 space-y-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Architecture section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 space-y-6 border border-violet-500/20"
          style={{ boxShadow: '0 0 60px rgba(124,58,237,0.1)' }}
        >
          <div className="section-badge mx-auto w-fit">Architecture</div>
          <h2 className="text-3xl font-display font-bold text-white">
            Fully local. Zero cloud. <span className="gradient-text">100% private.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { layer: 'Frontend', tech: 'React + Vite', color: '#06b6d4' },
              { layer: 'Backend',  tech: 'FastAPI',      color: '#7c3aed' },
              { layer: 'NLP',      tech: 'HuggingFace',  color: '#a855f7' },
              { layer: 'Database', tech: 'SQLite',        color: '#22c55e' },
            ].map(({ layer, tech, color }) => (
              <div key={layer} className="glass rounded-xl p-4 space-y-1">
                <div className="text-xs text-slate-500 uppercase tracking-wider">{layer}</div>
                <div className="font-semibold" style={{ color }}>{tech}</div>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/about')}
            className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 mx-auto transition-colors"
          >
            View architecture details <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </section>
    </PageTransition>
  );
}
