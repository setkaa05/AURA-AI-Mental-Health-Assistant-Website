import { create } from 'zustand';
import { ChatMessage, EmotionResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  lastEmotion: EmotionResult | null;
  addMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  setLoading: (v: boolean) => void;
  setLastEmotion: (e: EmotionResult) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  lastEmotion: null,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: uuidv4() }],
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setLastEmotion: (lastEmotion) => set({ lastEmotion }),
  clearMessages: () => set({ messages: [] }),
}));
