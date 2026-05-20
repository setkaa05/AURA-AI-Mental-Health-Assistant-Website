import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Globe, Cpu, Clock } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import AuraOrb from '../components/three/AuraOrb';
import EmotionBadge from '../components/ui/EmotionBadge';
import TypingIndicator from '../components/ui/TypingIndicator';
import GlassCard from '../components/ui/GlassCard';
import EmotionRadar from '../components/charts/EmotionRadar';
import WebcamEmotion from '../components/ui/WebcamEmotion';
import { useAppStore } from '../store/appStore';
import { useChatStore } from '../store/chatStore';
import { chatAPI } from '../api/client';
import { Emotion, EMOTION_COLORS, EMOTION_EMOJIS } from '../types';

export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sessionId, currentEmotion, setEmotion, ambientTheme, language } = useAppStore();
  const { messages, isLoading, lastEmotion, addMessage, setLoading, setLastEmotion, clearMessages } = useChatStore();
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setLoading(true);

    addMessage({ role: 'user', content: text, language: language || 'auto', timestamp: new Date().toISOString() });

    try {
      const res = await chatAPI.sendMessage(text, sessionId, language || 'auto');
      setEmotion(res.emotion);
      setLastEmotion(res.emotion);
      addMessage({
        role: 'assistant',
        content: res.ai_response,
        language: res.language,
        timestamp: res.timestamp,
        emotion: res.emotion,
      });
    } catch {
      addMessage({
        role: 'assistant',
        content: "I'm here for you. (Backend offline — please start the Python server.)",
        language: 'en',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [input, isLoading, sessionId, language, addMessage, setEmotion, setLastEmotion, setLoading]);

  return (
    <PageTransition>
      {/* Ambient bg */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${accentColor}12, transparent)` }}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-6 h-[calc(100vh-56px)] flex gap-4">

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <GlassCard className="p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AuraOrb emotion={currentEmotion} canvasSize={48} size={0.8} className="flex-shrink-0" />
              <div>
                <div className="font-display font-semibold text-white">AURA</div>
                <div className="text-xs text-slate-400">Emotional AI Companion · {messages.length} messages</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastEmotion && (
                <EmotionBadge emotion={lastEmotion.primary_emotion as Emotion} confidence={lastEmotion.confidence} showScore />
              )}
              <button
                onClick={clearMessages}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </GlassCard>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
                >
                  <AuraOrb emotion="neutral" canvasSize={120} size={1} />
                  <p className="text-slate-400 max-w-xs text-sm">
                    Share what's on your mind. I'll detect your emotion, understand your language, and respond with empathy.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["I'm feeling anxious today", "मुझे बहुत खुशी है!", "நான் மிகவும் சோர்வாக இருக்கிறேன்"].map(s => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); }}
                        className="text-xs px-3 py-1.5 glass rounded-full text-slate-400 hover:text-white hover:border-violet-500/40 border border-white/5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="w-4 h-4 rounded-full" style={{ background: `radial-gradient(${accentColor}, ${accentColor}66)`, boxShadow: `0 0 8px ${accentColor}` }} />
                        <span className="text-xs text-slate-500">AURA</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-slate-200'}`}>
                      {msg.content}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      {msg.emotion && (
                        <EmotionBadge emotion={msg.emotion.primary_emotion as Emotion} size="sm" confidence={msg.emotion.confidence} showScore />
                      )}
                      <span className="text-xs text-slate-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <GlassCard className="p-3">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Type in any language… (Enter to send)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none outline-none leading-relaxed max-h-32"
                style={{ fieldSizing: 'content' } as React.CSSProperties}
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl flex-shrink-0 transition-all disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #06b6d4)` }}
              >
                <Send size={15} className="text-white" />
              </motion.button>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          <WebcamEmotion />
          {/* Orb */}
          <GlassCard className="p-4 flex flex-col items-center gap-2" glow={accentColor}>
            <AuraOrb emotion={currentEmotion} canvasSize={140} size={1.1} />
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current State</div>
              <EmotionBadge emotion={currentEmotion} confidence={lastEmotion?.confidence} showScore size="md" />
            </div>
          </GlassCard>

          {/* Radar */}
          {lastEmotion?.scores && (
            <GlassCard className="p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Emotion Scores</div>
              <EmotionRadar scores={lastEmotion.scores} />
            </GlassCard>
          )}

          {/* Metrics */}
          {lastEmotion && (
            <GlassCard className="p-4 space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Model Metrics</div>
              {[
                { icon: Globe, label: 'Sentiment', val: lastEmotion.sentiment },
                { icon: Cpu,   label: 'Device',   val: lastEmotion.device },
                { icon: Clock, label: 'Inference', val: `${lastEmotion.inference_time_ms}ms` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Icon size={11} /> {label}
                  </div>
                  <span className="text-slate-300 font-mono capitalize">{val}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 text-xs text-slate-600 font-mono truncate">
                {lastEmotion.model?.split('/')[1] || lastEmotion.model}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
