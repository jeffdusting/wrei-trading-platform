import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1B2A4A',
        'primary-accent': '#0EA5E9',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        downer: {
          blue: '#003DA5',
          lightBlue: '#00A9E0',
          white: '#FFFFFF',
          grey: '#F5F5F5',
        },
        bloomberg: {
          black: '#0A0A0B',
          darkGrey: '#1A1A1B',
          mediumGrey: '#2A2A2B',
          lightGrey: '#3A3A3B',
          orange: '#FF6B1A',
          green: '#00C896',
          amber: '#FFB800',
          red: '#FF4757',
          blue: '#0EA5E9',
          purple: '#8B5CF6',
        },
      },
      backgroundColor: {
        primary: '#F8FAFC',
        card: '#FFFFFF',
        terminal: {
          primary: '#0A0A0B',
          secondary: '#1A1A1B',
          light: '#F8F9FA',
          white: '#FFFFFF',
        },
      },
      textColor: {
        primary: '#1E293B',
        secondary: '#64748B',
        terminal: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          tertiary: '#808080',
          inverse: '#1E293B',
          inverseSecondary: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'bloomberg-interface': ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        'bloomberg-financial': ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'bloomberg-xs': ['10px', { lineHeight: '1.2', letterSpacing: '0.8px' }],
        'bloomberg-sm': ['11px', { lineHeight: '1.3' }],
        'bloomberg-md': ['12px', { lineHeight: '1.4' }],
        'bloomberg-lg': ['16px', { lineHeight: '1.3' }],
        'bloomberg-xl': ['18px', { lineHeight: '1.3' }],
      },
      spacing: {
        'terminal-xs': '2px',
        'terminal-sm': '4px',
        'terminal-md': '8px',
        'terminal-lg': '12px',
        'terminal-xl': '16px',
      },
      borderWidth: {
        terminal: '0.5px',
      },
      boxShadow: {
        terminal: '0 0 20px rgba(255, 107, 26, 0.1)',
        'terminal-glow': '0 0 10px rgba(255, 107, 26, 0.2)',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
  },
  plugins: [],
}

export default config
