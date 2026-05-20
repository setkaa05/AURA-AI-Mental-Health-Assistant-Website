import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Research from './pages/Research';
import Voice from './pages/Voice';
import Wellness from './pages/Wellness';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';
import { useAppStore } from './store/appStore';
import { healthAPI } from './api/client';

export default function App() {
  const { setBackendOnline, ambientTheme, currentEmotion } = useAppStore();

  useEffect(() => {
    const checkHealth = () => {
      healthAPI.check()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, [setBackendOnline]);

  return (
    <BrowserRouter>
      <div
        className="min-h-screen font-sans transition-colors duration-1000"
        style={{ backgroundColor: ambientTheme.bg || '#0a0a0f' }}
      >
        {/* Global ambient glow based on emotion */}
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${ambientTheme.accent}18 0%, transparent 60%)`,
          }}
        />
        <Navbar />
        <main className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/chat"      element={<Chat />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/research"  element={<Research />} />
              <Route path="/voice"     element={<Voice />} />
              <Route path="/wellness"  element={<Wellness />} />
              <Route path="/profile"   element={<Profile />} />
              <Route path="/settings"  element={<Settings />} />
              <Route path="/about"     element={<About />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
