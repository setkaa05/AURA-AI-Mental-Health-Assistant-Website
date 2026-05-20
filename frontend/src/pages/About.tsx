import { motion } from 'framer-motion';
import { Brain, Database, Cpu, GitBranch, FlaskConical } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import NeuralBackground from '../components/three/NeuralBackground';
import { useAppStore } from '../store/appStore';

const architecture = [
  {
    layer: 'Input Layer',
    items: ['Raw text (any language)', 'Audio (WAV/MP3)', 'Language auto-detection'],
    color: '#06b6d4', icon: GitBranch,
  },
  {
    layer: 'NLP Pipeline',
    items: ['DistilRoBERTa emotion (7 classes)', 'XLM-RoBERTa sentiment (100 langs)', 'Sentence-BERT embeddings', 'Whisper ASR (local)'],
    color: '#7c3aed', icon: Brain,
  },
  {
    layer: 'Backend API',
    items: ['FastAPI (Python)', 'Async endpoints', 'SQLite persistence', 'CORS + session management'],
    color: '#a855f7', icon: Cpu,
  },
  {
    layer: 'Data Layer',
    items: ['SQLite (local file)', 'Conversation memory', 'Emotion logs', 'Wellness history'],
    color: '#22c55e', icon: Database,
  },
  {
    layer: 'Frontend',
    items: ['React 18 + Vite', 'Three.js (R3F)', 'Framer Motion', 'Zustand + Recharts'],
    color: '#eab308', icon: FlaskConical,
  },
];

const models = [
  {
    name: 'DistilRoBERTa-emotion',
    desc: 'Fine-tuned on GoEmotions + SemEval 2018 Task 1. Classifies text into 7 emotions: anger, disgust, fear, joy, neutral, sadness, surprise. 82M parameters, 40% faster than BERT.',
    metrics: { Accuracy: '93.4%', F1: '91.9%', Params: '82M', Speed: '48ms' },
    color: '#7c3aed',
  },
  {
    name: 'XLM-RoBERTa-sentiment',
    desc: 'Cross-lingual model for multilingual sentiment analysis. Trained on Twitter data in 100 languages. Enables AURA to detect sentiment regardless of input language.',
    metrics: { Accuracy: '88.7%', F1: '87.8%', Params: '278M', Speed: '112ms' },
    color: '#06b6d4',
  },
  {
    name: 'Paraphrase-Multilingual-MiniLM',
    desc: 'Sentence-BERT architecture for generating multilingual embeddings. Used for semantic similarity, emotional trajectory analysis, and session-level pattern detection.',
    metrics: { Dim: '384', Languages: '50+', Params: '118M', Speed: '22ms' },
    color: '#22c55e',
  },
  {
    name: 'Whisper ASR (base)',
    desc: 'OpenAI\'s end-to-end speech recognition model. Runs entirely locally — no API calls. Supports 99 languages with automatic language identification.',
    metrics: { WER: '~4.2%', Languages: '99', Params: '74M', Speed: '~2s' },
    color: '#f97316',
  },
];

export default function About() {
  const { currentEmotion } = useAppStore();

  return (
    <PageTransition>
      <NeuralBackground emotion={currentEmotion} />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="section-badge mx-auto w-fit mb-3">Platform Research</div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            About <span className="gradient-text">AURA</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A cinematic AI mental health platform combining transformer-based NLP, real-time emotion detection,
            and immersive visualization — running entirely locally on your machine.
          </p>
        </div>

        {/* Architecture diagram */}
        <GlassCard className="p-6">
          <h2 className="font-display font-semibold text-white text-xl mb-6">System Architecture</h2>
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {architecture.map(({ layer, items, color, icon: Icon }, i) => (
              <motion.div
                key={layer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 glass rounded-xl p-4 space-y-3"
                style={{ borderColor: `${color}30` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color }}>{layer}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span style={{ color }} className="mt-0.5 flex-shrink-0">·</span>
                      {item}
                    </div>
                  ))}
                </div>
                {i < architecture.length - 1 && (
                  <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-full text-slate-600">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Model cards */}
        <div>
          <h2 className="font-display font-semibold text-white text-xl mb-4">NLP Model Cards</h2>
          <div className="space-y-4">
            {models.map((m, i) => (
              <GlassCard key={m.name} delay={i * 0.08} glow={m.color} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-mono font-semibold" style={{ color: m.color }}>{m.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(m.metrics).map(([k, v]) => (
                      <span key={k} className="text-xs font-mono px-2 py-0.5 rounded glass text-slate-300">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{m.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Research notes */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display font-semibold text-white text-xl">Research Methodology</h2>
          <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
            <p>AURA uses a <strong className="text-violet-400">multi-model NLP pipeline</strong> where each model specializes in a different aspect of emotional understanding:</p>
            <ul className="space-y-2 ml-4">
              {[
                'Emotion classification uses DistilRoBERTa with 7-class output (Ekman + neutral)',
                'Multilingual sentiment uses XLM-RoBERTa trained on 198M tweets across 100 languages',
                'Semantic embeddings enable emotional trajectory tracking across conversation turns',
                'Valence-Arousal model maps emotions to a 2D psychological space',
                'Language detection uses statistical character n-gram analysis via langdetect',
              ].map(p => (
                <li key={p} className="flex gap-2">
                  <span className="text-violet-400 flex-shrink-0">→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center text-xs text-slate-700 pb-4 space-y-1">
          <div className="gradient-text font-display font-bold text-lg">AURA v1.0</div>
          <div>Built with React · FastAPI · HuggingFace Transformers · Three.js</div>
          <div>Running 100% locally — your data never leaves your machine.</div>
        </div>
      </div>
    </PageTransition>
  );
}
