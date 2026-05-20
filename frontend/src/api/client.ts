import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (message: string, sessionId?: string, language = 'auto') =>
    api.post('/chat/message', { message, session_id: sessionId, language }).then(r => r.data),

  getHistory: (sessionId: string, limit = 50) =>
    api.get(`/chat/history/${sessionId}`, { params: { limit } }).then(r => r.data),

  getSessions: () =>
    api.get('/chat/sessions').then(r => r.data),

  clearHistory: (sessionId: string) =>
    api.delete(`/chat/history/${sessionId}`).then(r => r.data),
};

// ── Emotion ───────────────────────────────────────────────────────────────────
export const emotionAPI = {
  analyze: (text: string, language = 'auto') =>
    api.post('/emotion/analyze', { text, language }).then(r => r.data),

  batchAnalyze: (texts: string[]) =>
    api.post('/emotion/batch', { texts }).then(r => r.data),

  similarity: (text1: string, text2: string) =>
    api.post('/emotion/similarity', { texts: [text1, text2] }).then(r => r.data),

  getHistory: (sessionId?: string, limit = 100) =>
    api.get('/emotion/history', { params: { session_id: sessionId, limit } }).then(r => r.data),

  getTrajectory: (sessionId?: string, limit = 20) =>
    api.get('/emotion/trajectory', { params: { session_id: sessionId, limit } }).then(r => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  weekly: (sessionId?: string) =>
    api.get('/analytics/weekly', { params: { session_id: sessionId } }).then(r => r.data),

  trends: (days = 30, sessionId?: string) =>
    api.get('/analytics/trends', { params: { days, session_id: sessionId } }).then(r => r.data),

  radar: (sessionId?: string, limit = 50) =>
    api.get('/analytics/radar', { params: { session_id: sessionId, limit } }).then(r => r.data),

  insights: (sessionId?: string) =>
    api.get('/analytics/insights', { params: { session_id: sessionId } }).then(r => r.data),
};

// ── Research ──────────────────────────────────────────────────────────────────
export const researchAPI = {
  getModels: () =>
    api.get('/research/models').then(r => r.data),

  getModelDetail: (modelId: string) =>
    api.get(`/research/model/${modelId}`).then(r => r.data),

  getLossCurves: () =>
    api.get('/research/loss-curves').then(r => r.data),

  compareModels: (text: string, models: string[]) =>
    api.post('/research/compare', { text, models }).then(r => r.data),
};

// ── Voice ─────────────────────────────────────────────────────────────────────
export const voiceAPI = {
  transcribe: (audioBlob: Blob) => {
    const form = new FormData();
    form.append('file', audioBlob, 'recording.wav');
    return api.post('/voice/transcribe', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getStatus: () =>
    api.get('/voice/status').then(r => r.data),
};

// ── Wellness ──────────────────────────────────────────────────────────────────
export const wellnessAPI = {
  getRecommendations: (emotion: string, sessionId?: string, limit = 3) =>
    api.post('/wellness/recommendations', { emotion, session_id: sessionId, limit }).then(r => r.data),

  getBreathing: (emotion: string) =>
    api.get(`/wellness/breathing/${emotion}`).then(r => r.data),

  getJournalPrompt: (emotion: string) =>
    api.get(`/wellness/journal-prompt/${emotion}`).then(r => r.data),
};

// ── Health ────────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () =>
    api.get('/health').then(r => r.data),
};

// ── Vision ────────────────────────────────────────────────────────────────────
export const visionAPI = {
  analyzeFrame: (image: string) =>
    api.post('/vision/emotion', { image }).then(r => r.data),
};

export default api;
