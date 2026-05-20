import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle, BarChart2, Mic, Sparkles, FlaskConical,
  Heart, User, Settings, Info, Zap
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { EMOTION_COLORS } from '../../types';

const links = [
  { to: '/',          label: 'AURA',      icon: Zap,          special: true },
  { to: '/chat',      label: 'Chat',      icon: MessageCircle },
  { to: '/dashboard', label: 'Analytics', icon: BarChart2 },
  { to: '/research',  label: 'Research',  icon: FlaskConical },
  { to: '/voice',     label: 'Voice',     icon: Mic },
  { to: '/wellness',  label: 'Wellness',  icon: Heart },
  { to: '/profile',   label: 'Profile',   icon: User },
  { to: '/settings',  label: 'Settings',  icon: Settings },
  { to: '/about',     label: 'About',     icon: Info },
];

export default function Navbar() {
  const { currentEmotion, backendOnline } = useAppStore();
  const accentColor = EMOTION_COLORS[currentEmotion] || '#7c3aed';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-7 h-7">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-7 h-7 rounded-full border border-violet-500/50"
              style={{ borderColor: `${accentColor}80` }}
            />
            <div
              className="absolute inset-1 rounded-full"
              style={{ background: `radial-gradient(circle, ${accentColor}cc, ${accentColor}44)` }}
            />
          </div>
          <span className="font-display font-bold text-lg tracking-wide gradient-text">AURA</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {links.slice(1).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                 ${isActive
                   ? 'text-white bg-white/10 border border-white/10'
                   : 'text-slate-400 hover:text-white hover:bg-white/5'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={13} style={{ color: isActive ? accentColor : undefined }} />
                  <span className="hidden sm:inline">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Backend status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: backendOnline ? '#22c55e' : '#ef4444',
                        boxShadow: backendOnline ? '0 0 6px #22c55e' : '0 0 6px #ef4444' }}
            />
            <span className="text-slate-500 hidden sm:inline">
              {backendOnline ? 'Live' : 'Offline'}
            </span>
          </div>
          <div
            className="text-xs px-2 py-0.5 rounded-full border font-mono"
            style={{ borderColor: `${accentColor}50`, color: accentColor, background: `${accentColor}12` }}
          >
            {currentEmotion}
          </div>
        </div>
      </div>
    </nav>
  );
}
