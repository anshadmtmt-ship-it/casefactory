/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casemark: {
          dark:    '#0a0a0a',
          light:   '#f8f8f8',
          accent:  '#1f1f1f',
        },
        violet: {
          primary:   '#7C3AED',
          glow:      '#A855F7',
          highlight: '#C084FC',
          dim:       '#6D28D9',
          ultra:     '#4C1D95',
        }
      },
      fontFamily: {
        sans:  ['Sora', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        marquee:         'marquee 40s linear infinite',
        'glow-pulse':    'glowPulse 3s ease-in-out infinite',
        'violet-float':  'violetFloat 8s ease-in-out infinite',
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%':      { opacity: '1.0', filter: 'blur(28px)' },
        },
        violetFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-12px) scale(1.02)' },
        },
      },
      boxShadow: {
        'violet-sm':  '0 0 12px rgba(124,58,237,0.25)',
        'violet-md':  '0 0 24px rgba(124,58,237,0.30), 0 0 48px rgba(168,85,247,0.12)',
        'violet-lg':  '0 0 40px rgba(124,58,237,0.35), 0 0 80px rgba(168,85,247,0.15)',
        'violet-xl':  '0 0 60px rgba(124,58,237,0.40), 0 0 120px rgba(168,85,247,0.18)',
      },
    },
  },
  plugins: [],
}
