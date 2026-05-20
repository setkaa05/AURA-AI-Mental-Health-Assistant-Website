import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Palette, Cpu, Volume2, Save } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { useAppStore } from '../store/appStore';

export default function Settings() {
  const { language, setLanguage, visualIntensity, setVisualIntensity } = useAppStore();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="section-badge mb-2">Configuration</div>
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
        </div>

        {/* Language */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={16} className="text-cyan-400" />
            <h3 className="font-display font-semibold text-white">Language</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { code: 'auto', label: 'Auto', flag: '🌐' },
              { code: 'en',   label: 'English',   flag: '🇬🇧' },
              { code: 'hi',   label: 'हिन्दी',      flag: '🇮🇳' },
              { code: 'ta',   label: 'தமிழ்',       flag: '🇮🇳' },
              { code: 'te',   label: 'తెలుగు',      flag: '🇮🇳' },
              { code: 'ml',   label: 'മലയാളം',     flag: '🇮🇳' },
            ].map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`p-3 rounded-xl text-xs text-center transition-all border ${language === code ? 'border-violet-500/60 bg-violet-500/15 text-violet-300' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                <div className="text-xl mb-1">{flag}</div>
                <div className="truncate">{label}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Visual Intensity */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={16} className="text-violet-400" />
            <h3 className="font-display font-semibold text-white">Visual Intensity</h3>
          </div>
          <div className="flex gap-3">
            {(['low','medium','high'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisualIntensity(v)}
                className={`flex-1 py-3 rounded-xl text-sm capitalize border transition-all ${visualIntensity === v ? 'border-violet-500/60 bg-violet-500/15 text-violet-300' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}
              >{v}</button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2">Higher intensity uses more GPU for Three.js animations.</p>
        </GlassCard>

        {/* Model Info */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={16} className="text-green-400" />
            <h3 className="font-display font-semibold text-white">Active NLP Models</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { name: 'Emotion Classifier', model: 'DistilRoBERTa (82M params)', status: 'active' },
              { name: 'Sentiment Analysis', model: 'XLM-RoBERTa (278M params)', status: 'active' },
              { name: 'Sentence Embeddings', model: 'MiniLM-L12-v2 (multilingual)', status: 'active' },
              { name: 'Speech-to-Text', model: 'Whisper base', status: 'optional' },
            ].map(({ name, model, status }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-slate-300">{name}</div>
                  <div className="text-xs text-slate-600 font-mono">{model}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'active' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={save}
          className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Settings'}
        </motion.button>
      </div>
    </PageTransition>
  );
}
