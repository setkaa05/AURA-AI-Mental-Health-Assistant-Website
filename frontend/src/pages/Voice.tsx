import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import AuraOrb from '../components/three/AuraOrb';
import WaveformViz from '../components/three/WaveformViz';
import EmotionBadge from '../components/ui/EmotionBadge';
import { useAppStore } from '../store/appStore';
import { voiceAPI, emotionAPI } from '../api/client';
import { EMOTION_COLORS, Emotion } from '../types';

export default function Voice() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [emotionResult, setEmotionResult] = useState<any>(null);
  const [status, setStatus] = useState<string>('Click the microphone to begin');
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { currentEmotion } = useAppStore();
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(t => t.stop());
        setProcessing(true);
        setStatus('Transcribing with Whisper…');
        try {
          const res = await voiceAPI.transcribe(blob);
          setTranscript(res.transcript);
          setStatus('Analyzing emotion…');
          const emotion = await emotionAPI.analyze(res.transcript);
          setEmotionResult(emotion);
          setStatus('Done!');
        } catch { setStatus('Transcription unavailable — backend offline or Whisper not installed'); }
        finally { setProcessing(false); }
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setStatus('Recording… speak now');
    } catch { setStatus('Microphone access denied'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center">
          <div className="section-badge mx-auto w-fit mb-3">Voice Interaction</div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Speak to <span className="gradient-text">AURA</span></h1>
          <p className="text-slate-400">Whisper-powered speech recognition with real-time emotion detection</p>
        </div>

        {/* Central Mic */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <AuraOrb emotion={currentEmotion} canvasSize={200} size={1.3} />
            {recording && (
              <div className="absolute inset-0 pointer-events-none">
                {[1,2,3].map(i => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border"
                    style={{ borderColor: accentColor }}
                    animate={{ scale: [1, 1.4 + i * 0.2], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Waveform */}
          <WaveformViz emotion={currentEmotion} isActive={recording} width={400} height={80} />

          {/* Mic button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={recording ? stopRecording : startRecording}
            disabled={processing}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
            style={{
              background: recording
                ? 'linear-gradient(135deg, #ef4444, #f97316)'
                : `linear-gradient(135deg, ${accentColor}, #06b6d4)`,
              boxShadow: recording ? '0 0 40px rgba(239,68,68,0.5)' : `0 0 40px ${accentColor}55`,
            }}
          >
            {recording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
          </motion.button>

          <p className="text-sm text-slate-500">{status}</p>
        </div>

        {/* Results */}
        <AnimatePresence>
          {transcript && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <GlassCard className="p-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Transcript</div>
                <p className="text-slate-200 leading-relaxed">{transcript}</p>
              </GlassCard>
              {emotionResult && (
                <GlassCard className="p-5 space-y-3" glow={accentColor}>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Detected Emotion</div>
                  <EmotionBadge emotion={emotionResult.primary_emotion as Emotion} confidence={emotionResult.confidence} showScore size="lg" />
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(emotionResult.scores || {}).map(([e, s]) => (
                      <div key={e} className="text-center">
                        <div className="text-xs text-slate-500 capitalize mb-1">{e}</div>
                        <div className="text-xs font-mono text-violet-400">{Math.round((s as number)*100)}%</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status card */}
        <GlassCard className="p-5">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">System Info</div>
          <div className="space-y-2 text-sm">
            {[
              { label: 'STT Model',    val: 'OpenAI Whisper (base)' },
              { label: 'NLP Model',    val: 'DistilRoBERTa-emotion' },
              { label: 'Processing',   val: 'Local CPU/GPU' },
              { label: 'Languages',    val: 'EN, HI, TA, TE, ML + 95 more' },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-mono text-xs">{val}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
