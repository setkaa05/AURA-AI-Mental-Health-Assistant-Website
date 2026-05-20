/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#0a0a0f',
        midnight:'#0d1b2a',
        aurora:  '#7c3aed',
        cyan:    '#06b6d4',
        violet:  '#a855f7',
        neon:    '#22d3ee',
        ember:   '#f97316',
        rose:    '#f43f5e',
        jade:    '#22c55e',
        gold:    '#eab308',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite alternate',
        'spin-slow':    'spin 8s linear infinite',
        'neural-pulse': 'neuralPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(124,58,237,0.3)' },
          '100%': { boxShadow: '0 0 60px rgba(124,58,237,0.8), 0 0 100px rgba(6,182,212,0.4)' },
        },
        neuralPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
      },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #0d1b2a 50%, #1a0a2e 100%)',
        'card-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-gradient':   'radial-gradient(ellipse at center, rgba(124,58,237,0.3) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
