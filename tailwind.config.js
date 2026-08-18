/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep green-black command-center surface tones
        void: {
          DEFAULT: '#070B09',
          soft: '#0C1310',
          panel: '#111A15',
          raised: '#16211B',
          line: '#233028',
        },
        ink: {
          DEFAULT: '#E9EFEA',
          muted: '#93A29A',
          faint: '#5C6B62',
        },
        // Thermal risk scale
        risk: {
          safe: '#2FD9A8',
          elevated: '#F4C744',
          high: '#FF9F1C',
          extreme: '#FF4B3E',
        },
        signal: '#7CF5C4',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(124, 245, 196, 0.06) inset, 0 12px 32px -16px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'thermal-scan': 'linear-gradient(90deg, transparent, rgba(124,245,196,0.5), transparent)',
        'thermal-gradient': 'linear-gradient(90deg, #2FD9A8 0%, #F4C744 45%, #FF9F1C 70%, #FF4B3E 100%)',
      },
      animation: {
        scan: 'scan 4s linear infinite',
        pulseDot: 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
      },
    },
  },
  plugins: [],
};
