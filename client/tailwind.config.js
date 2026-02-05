/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom cybersecurity theme colors
        cyber: {
          black: '#0a0a0f',
          dark: '#111118',
          gray: '#1a1a24',
          border: '#2a2a3a',
        },
        neon: {
          cyan: '#00d4ff',
          purple: '#9d4edd',
          green: '#00ff88',
          orange: '#ff6b35',
          red: '#ff1744',
          yellow: '#ffc107',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow': '0 0 30px rgba(0, 212, 255, 0.15)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 212, 255, 0.4), 0 0 10px rgba(0, 212, 255, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.4)',
          },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
