import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import ModelComparison from '../components/charts/ModelComparison';
import { researchAPI } from '../api/client';
import { ModelBenchmark } from '../types';

type Metric = 'accuracy' | 'f1' | 'precision' | 'recall';

export default function Research() {
  const [models, setModels] = useState<Record<string, ModelBenchmark>>({});
  const [lossCurves, setLossCurves] = useState<any>({});
  const [metric, setMetric] = useState<Metric>('accuracy');
  const [selectedModel, setSelectedModel] = useState<string>('distilroberta');
  const [compareText, setCompareText] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [comparing, setComparing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([researchAPI.getModels(), researchAPI.getLossCurves()])
      .then(([m, l]) => { setModels(m.models || {}); setLossCurves(l.curves || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCompare = async () => {
    if (!compareText.trim()) return;
    setComparing(true);
    try {
      const result = await researchAPI.compareModels(compareText, ['distilroberta']);
      setCompareResult(result);
    } catch { } finally { setComparing(false); }
  };

  const confusionLabels = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise'];
  const CONFUSION_MOCK = [
    [142,3,8,2,4,5,1],[4,98,3,1,6,2,0],[7,2,156,1,3,8,4],
    [2,1,1,287,5,3,7],[5,4,3,6,412,9,2],[6,2,9,4,8,198,1],[1,0,5,8,3,2,87],
  ];

  const selectedModelData = models[selectedModel];
  const lossData = lossCurves[selectedModel];
  const lossChartData = lossData
    ? lossData.epochs.map((e: number, i: number) => ({
        epoch: e,
        train: lossData.train_loss[i],
        val: lossData.val_loss[i],
      }))
    : [];

  return (
    <PageTransition>
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="section-badge mb-2">NLP Research Lab</div>
          <h1 className="text-3xl font-display font-bold text-white">Research Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Comparative analysis of transformer models for emotion classification</p>
        </div>

        {/* Model cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(models).map(([id, m], i) => (
            <GlassCard
              key={id}
              delay={i * 0.05}
              hover
              glow={m.color}
              onClick={() => setSelectedModel(id)}
              className={`p-4 space-y-2 transition-all ${selectedModel === id ? 'ring-1' : ''}`}
              style={{ '--tw-ring-color': m.color } as any}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${m.color}20`, color: m.color }}>{m.params}</span>
                {selectedModel === id && <div className="w-2 h-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} />}
              </div>
              <div className="font-display font-semibold text-white text-sm">{m.name}</div>
              <div className="space-y-1.5 text-xs">
                {(['accuracy','f1'] as Metric[]).map(k => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{k}</span>
                    <span className="font-mono" style={{ color: m.color }}>{(m[k] * 100).toFixed(1)}%</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-slate-500">Speed</span>
                  <span className="font-mono text-slate-300">{m.inference_time_ms}ms</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Metric tabs + Bar chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white">Model Performance Comparison</h3>
            <div className="flex gap-1 glass rounded-xl p-1">
              {(['accuracy','f1','precision','recall'] as Metric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${metric === m ? 'bg-violet-600/40 text-violet-300 border border-violet-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {Object.keys(models).length > 0
            ? <ModelComparison models={models} metric={metric} />
            : <div className="h-[240px] flex items-center justify-center text-slate-600">Loading model data…</div>
          }
        </GlassCard>

        {/* Loss curves + Confusion matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-white mb-1">Training & Validation Loss</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedModelData?.name || 'Select a model'} — GoEmotions dataset</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lossChartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Epoch', position: 'insideBottom', fill: '#475569', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="train" stroke={selectedModelData?.color || '#7c3aed'} strokeWidth={2} dot={false} name="Train Loss" />
                <Line type="monotone" dataKey="val" stroke="#06b6d4" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Val Loss" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-white mb-1">Confusion Matrix</h3>
            <p className="text-xs text-slate-500 mb-3">DistilRoBERTa · GoEmotions test set</p>
            <div className="overflow-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    <td className="p-1 text-slate-600 text-center">↓pred / true→</td>
                    {confusionLabels.map(l => (
                      <td key={l} className="p-1 text-center font-medium" style={{ color: '#7c3aed' }}>{l.slice(0,3)}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CONFUSION_MOCK.map((row, i) => {
                    const rowMax = Math.max(...row);
                    return (
                      <tr key={i}>
                        <td className="p-1 text-slate-500 text-right pr-2 font-medium">{confusionLabels[i].slice(0,3)}</td>
                        {row.map((val, j) => {
                          const intensity = val / rowMax;
                          const isCorrect = i === j;
                          return (
                            <td
                              key={j}
                              className="p-1 text-center font-mono rounded"
                              style={{
                                background: isCorrect
                                  ? `rgba(124,58,237,${0.15 + intensity * 0.5})`
                                  : `rgba(239,68,68,${intensity * 0.3})`,
                                color: intensity > 0.3 ? '#e2e8f0' : '#475569',
                              }}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Live model comparison */}
        <GlassCard className="p-6">
          <h3 className="font-display font-semibold text-white mb-2">Live Model Inference</h3>
          <p className="text-xs text-slate-500 mb-4">Run a text through the live DistilRoBERTa model and see emotion scores in real-time</p>
          <div className="flex gap-3 mb-5">
            <input
              value={compareText}
              onChange={e => setCompareText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCompare()}
              placeholder="Enter text to analyze emotions…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-all"
            />
            <button
              onClick={handleCompare}
              disabled={!compareText.trim() || comparing}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              {comparing ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
          {compareResult && (
            <div className="space-y-3">
              {Object.entries(compareResult.results).map(([id, res]: [string, any]) => (
                <div key={id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-white text-sm">{res.model}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono">{res.inference_time_ms}ms</span>
                      {res.live && <span className="text-green-400 flex items-center gap-1">● Live</span>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(res.scores)
                      .sort(([,a],[,b]) => (b as number) - (a as number))
                      .map(([emotion, score]) => {
                        const pct = Math.round((score as number) * 100);
                        const isTop = emotion === res.primary_emotion;
                        return (
                          <div key={emotion} className="flex items-center gap-2">
                            <div className={`w-16 text-xs capitalize ${isTop ? 'text-violet-400 font-medium' : 'text-slate-500'}`}>{emotion}</div>
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full rounded-full"
                                style={{ background: isTop ? '#7c3aed' : '#334155' }}
                              />
                            </div>
                            <div className="w-8 text-xs font-mono text-slate-500 text-right">{pct}%</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Model details */}
        {selectedModelData && (
          <GlassCard className="p-6" glow={selectedModelData.color}>
            <h3 className="font-display font-semibold text-white mb-4">
              {selectedModelData.name} — Architecture Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                {[
                  ['Parameters', selectedModelData.params],
                  ['Model Size',  `${selectedModelData.model_size_mb} MB`],
                  ['Avg Inference', `${selectedModelData.inference_time_ms}ms`],
                  ['Task',       selectedModelData.task],
                  ['Dataset',    selectedModelData.dataset],
                ].map(([k,v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500 w-28 flex-shrink-0">{k}:</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Architecture</div>
                  <div className="font-mono text-xs text-slate-300 glass rounded-lg p-3 leading-relaxed">
                    {selectedModelData.architecture}
                  </div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{selectedModelData.description}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </PageTransition>
  );
}
