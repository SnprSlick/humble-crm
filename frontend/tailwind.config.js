import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
     colors: {
        background: '#0d0d0d',
        surface: '#1a1a1d',
        highlight: '#262628',
        cardBackground: '#3f1e1e',    // New: rich red-tinted steel
        rowAccent: '#4a2b2b',         // New: alternating row color
        surfaceActive: '#353537',     // New: active/hover contrast
        accent: '#d60000',
        accentLight: '#ff4d4d',
        text: '#f0f0f0',              // Brighter text for clarity
        muted: '#bbbbbb',
        border: '#5a5a5a',            // Lighter for visible contrast
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        },

      fontFamily: {
            sans: ['Saira', ...defaultTheme.fontFamily.sans],
            header: ['Rajdhani', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.5)',
        panel: 'inset 0 0 0 1px #2a2a2d, 0 2px 6px rgba(0,0,0,0.3)',
        glow: '0 0 8px rgba(255, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
